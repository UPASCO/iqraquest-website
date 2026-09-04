'use client';

import { useId, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, cx } from '@/components/ui/primitives';
import { siteConfig } from '@/config/site.config';

/**
 * Contact form.
 *
 * The site is statically hosted and has no server of its own, so there
 * is nowhere to POST to by default. Rather than pretend otherwise, the
 * form behaves in one of two honest ways:
 *
 * - If `NEXT_PUBLIC_CONTACT_ENDPOINT` is set (a form relay such as
 *   Formspree, Basin or a Worker), the message is posted there and the
 *   visitor gets a real confirmation.
 * - Otherwise it composes a pre-filled `mailto:` and says so on screen,
 *   before opening it. Nothing is transmitted until the visitor sends
 *   it from their own mail client.
 *
 * Validation runs on the client because that is the only place there
 * is. It is a usability aid, not a security boundary — which is why the
 * form collects nothing sensitive and grants nothing.
 */

const SUBJECTS = [
  'support',
  'press',
  'partnership',
  'ip',
  'bug',
  'other',
] as const;

type Subject = (typeof SUBJECTS)[number];

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 4000;

/**
 * Deliberately conservative: it accepts the shapes real addresses take
 * and rejects the obvious mistakes, without trying to encode RFC 5322.
 * The authoritative check is whether the reply arrives.
 */
const EMAIL_RE = /^[^\s@,;:<>()[\]\\]+@[^\s@.,;:<>()[\]\\]+(\.[^\s@.,;:<>()[\]\\]+)+$/;

const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim();

type Errors = Partial<Record<'subject' | 'name' | 'email' | 'message', string>>;

export function ContactForm() {
  const t = useTranslations('contactPage.form');
  const ids = useId();

  const [subject, setSubject] = useState<Subject | ''>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honey, setHoney] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>(
    'idle',
  );

  const field = (suffix: string) => `${ids}-${suffix}`;

  function validate(): Errors {
    const next: Errors = {};
    if (!subject) next.subject = t('errors.subject');
    if (name.trim().length < 2) next.name = t('errors.name');
    if (!EMAIL_RE.test(email.trim())) next.email = t('errors.email');
    const length = message.trim().length;
    if (length < MESSAGE_MIN) next.message = t('errors.messageShort');
    else if (length > MESSAGE_MAX) next.message = t('errors.messageLong');
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Honeypot: a field no human sees. Anything in it is a bot, and the
    // submission is dropped silently so the bot learns nothing.
    if (honey.trim().length > 0) {
      setStatus('sent');
      return;
    }

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so a keyboard or screen-reader
      // user is not left guessing what failed.
      const firstKey = (
        ['subject', 'name', 'email', 'message'] as const
      ).find((key) => found[key]);
      if (firstKey) document.getElementById(field(firstKey))?.focus();
      return;
    }

    const subjectLine = `[${t(`subjects.${subject}`)}] ${siteConfig.siteName} — ${name.trim()}`;

    if (endpoint) {
      setStatus('sending');
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            subject: subjectLine,
            category: subject,
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          }),
        });
        if (!response.ok) throw new Error(String(response.status));
        setStatus('sent');
      } catch {
        setStatus('failed');
      }
      return;
    }

    // No relay configured: hand the message to the visitor's own mail
    // client, pre-filled.
    const body = `${message.trim()}\n\n—\n${name.trim()}\n${email.trim()}`;
    window.location.href =
      `mailto:${siteConfig.supportEmail}` +
      `?subject=${encodeURIComponent(subjectLine)}` +
      `&body=${encodeURIComponent(body)}`;
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <Card className="border-gold/30 p-8 text-center">
        <h2 className="font-display text-2xl text-text-primary">
          {t('successTitle')}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-secondary">
          {t('successBody')}
        </p>
      </Card>
    );
  }

  const inputClass =
    'w-full min-h-12 rounded-xl border bg-surface-inset/70 px-4 py-3 text-base text-text-primary placeholder:text-text-muted/70 transition-colors focus:border-gold focus:outline-none';

  const borderFor = (key: keyof Errors) =>
    errors[key] ? 'border-error' : 'border-gold/20';

  return (
    <Card className="p-6 sm:p-8">
      {!endpoint && (
        <div className="mb-8 rounded-xl border border-gold/20 bg-surface-inset/60 p-4">
          <p className="text-sm font-semibold text-gold">
            {t('mailFallbackTitle')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {t('mailFallbackBody', { email: siteConfig.supportEmail })}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {/* Honeypot. Hidden from sight and from assistive technology,
            and never focusable by keyboard. */}
        <div aria-hidden className="hidden">
          <label htmlFor={field('company')}>Company</label>
          <input
            id={field('company')}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honey}
            onChange={(event) => setHoney(event.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor={field('subject')}
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            {t('subjectLabel')}
          </label>
          <select
            id={field('subject')}
            value={subject}
            onChange={(event) => setSubject(event.target.value as Subject)}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? field('subject-error') : undefined}
            className={cx(inputClass, borderFor('subject'))}
          >
            <option value="">{t('subjectPlaceholder')}</option>
            {SUBJECTS.map((value) => (
              <option key={value} value={value}>
                {t(`subjects.${value}`)}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p id={field('subject-error')} className="mt-2 text-sm text-error">
              {errors.subject}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor={field('name')}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              {t('nameLabel')}
            </label>
            <input
              id={field('name')}
              type="text"
              autoComplete="name"
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('namePlaceholder')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? field('name-error') : undefined}
              className={cx(inputClass, borderFor('name'))}
            />
            {errors.name && (
              <p id={field('name-error')} className="mt-2 text-sm text-error">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={field('email')}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              {t('emailLabel')}
            </label>
            <input
              id={field('email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? field('email-error') : undefined}
              className={cx(inputClass, borderFor('email'))}
            />
            {errors.email && (
              <p id={field('email-error')} className="mt-2 text-sm text-error">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor={field('message')}
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            {t('messageLabel')}
          </label>
          <textarea
            id={field('message')}
            rows={7}
            maxLength={MESSAGE_MAX}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('messagePlaceholder')}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? field('message-error') : undefined}
            className={cx(inputClass, borderFor('message'), 'resize-y')}
          />
          {errors.message && (
            <p id={field('message-error')} className="mt-2 text-sm text-error">
              {errors.message}
            </p>
          )}
        </div>

        <p className="text-xs leading-relaxed text-text-muted">
          {t('consent')}
        </p>

        {status === 'failed' && (
          <p role="alert" className="text-sm text-error">
            {t('errors.failed', { email: siteConfig.supportEmail })}
          </p>
        )}

        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending'
            ? t('submitting')
            : endpoint
              ? t('submit')
              : t('openMail')}
        </Button>
      </form>
    </Card>
  );
}

'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button, Card, cx } from '@/components/ui/primitives';

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

/**
 * Every string the form renders, resolved on the server. The form is
 * interactive and must be a client component, but that is no reason to
 * ship the message catalogue and an ICU formatter with it.
 */
export interface ContactFormLabels {
  subjectLabel: string;
  subjectPlaceholder: string;
  subjects: Record<string, string>;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  openMail: string;
  consent: string;
  errors: {
    subject: string;
    name: string;
    email: string;
    messageShort: string;
    messageLong: string;
    /** Already formatted with the support address. */
    failed: string;
  };
  successTitle: string;
  successBody: string;
  mailFallbackTitle: string;
  /** Already formatted with the support address. */
  mailFallbackBody: string;
  /** The address the mailto: is composed for. */
  supportEmail: string;
  /** The product name used in the subject line. */
  siteName: string;
}

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

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
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
    if (!subject) next.subject = labels.errors.subject;
    if (name.trim().length < 2) next.name = labels.errors.name;
    if (!EMAIL_RE.test(email.trim())) next.email = labels.errors.email;
    const length = message.trim().length;
    if (length < MESSAGE_MIN) next.message = labels.errors.messageShort;
    else if (length > MESSAGE_MAX) next.message = labels.errors.messageLong;
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

    const subjectLine = `[${labels.subjects[subject]}] ${labels.siteName} — ${name.trim()}`;

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
      `mailto:${labels.supportEmail}` +
      `?subject=${encodeURIComponent(subjectLine)}` +
      `&body=${encodeURIComponent(body)}`;
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <Card className="border-gold/30 p-8 text-center">
        <h2 className="font-display text-2xl text-text-primary">
          {labels.successTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-secondary">
          {labels.successBody}
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
            {labels.mailFallbackTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {labels.mailFallbackBody}
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
            {labels.subjectLabel}
          </label>
          <select
            id={field('subject')}
            value={subject}
            onChange={(event) => setSubject(event.target.value as Subject)}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? field('subject-error') : undefined}
            className={cx(inputClass, borderFor('subject'))}
          >
            <option value="">{labels.subjectPlaceholder}</option>
            {SUBJECTS.map((value) => (
              <option key={value} value={value}>
                {labels.subjects[value]}
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
              {labels.nameLabel}
            </label>
            <input
              id={field('name')}
              type="text"
              autoComplete="name"
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={labels.namePlaceholder}
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
              {labels.emailLabel}
            </label>
            <input
              id={field('email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={labels.emailPlaceholder}
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
            {labels.messageLabel}
          </label>
          <textarea
            id={field('message')}
            rows={7}
            maxLength={MESSAGE_MAX}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={labels.messagePlaceholder}
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
          {labels.consent}
        </p>

        {status === 'failed' && (
          <p role="alert" className="text-sm text-error">
            {labels.errors.failed}
          </p>
        )}

        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending'
            ? labels.submitting
            : endpoint
              ? labels.submit
              : labels.openMail}
        </Button>
      </form>
    </Card>
  );
}

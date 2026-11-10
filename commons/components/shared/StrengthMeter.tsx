import type { PasswordValidation } from '@/commons/lib/validation/validatePassword';

type StrengthMeterProps = {
  /** Resultado de `validatePassword` sobre la contraseña actual. */
  validation: PasswordValidation;
};

/** Color de los segmentos rellenos por score (0–4). */
const SCORE_COLORS = [
  'bg-destructive',
  'bg-destructive',
  'bg-warning',
  'bg-success',
  'bg-success',
];

/** Color de la etiqueta de fuerza por score (0–4). */
const LABEL_COLORS = [
  'text-destructive',
  'text-destructive',
  'text-warning',
  'text-success',
  'text-success',
];

const EMPTY_SEGMENT = 'bg-surface-strong';

/**
 * Indicador de fuerza de la master key: 4 segmentos + etiqueta. Solo es
 * informativo, nunca bloquea el envío; quien decide eso es `validatePassword`.
 */
export const StrengthMeter = ({ validation }: StrengthMeterProps) => {
  const { score, strength, warnings } = validation;

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              segment < score ? SCORE_COLORS[score] : EMPTY_SEGMENT
            }`}
          />
        ))}
      </div>
      <p
        className={`text-caption leading-ui font-medium ${LABEL_COLORS[score]}`}
      >
        Fuerza: {strength}
        {warnings.length > 0 && (
          <span className="font-normal text-muted-foreground">
            {' '}
            · {warnings[0]}
          </span>
        )}
      </p>
    </div>
  );
};

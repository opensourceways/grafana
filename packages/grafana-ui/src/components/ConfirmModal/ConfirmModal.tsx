import React, { useState } from 'react';
import { css } from '@emotion/css';
import { Modal } from '../Modal/Modal';
import { IconName } from '../../types/icon';
import { Button } from '../Button';
import { useStyles2 } from '../../themes';
import { GrafanaThemeV2 } from '@grafana/data';
import { HorizontalGroup, Input } from '..';
import { selectors } from '@grafana/e2e-selectors';

export interface ConfirmModalProps {
  /** Toggle modal's open/closed state */
  isOpen: boolean;
  /** Title for the modal header */
  title: string;
  /** Modal content */
  body: React.ReactNode;
  /** Modal description */
  description?: React.ReactNode;
  /** Text for confirm button */
  confirmText: string;
  /** Text for dismiss button */
  dismissText?: string;
  /** Icon for the modal header */
  icon?: IconName;
  /** Text user needs to fill in before confirming */
  confirmationText?: string;
  /** Text for alternative button */
  alternativeText?: string;
  /** Confirm action callback */
  onConfirm(): void;
  /** Dismiss action callback */
  onDismiss(): void;
  /** Alternative action callback */
  onAlternative?(): void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  body,
  description,
  confirmText,
  confirmationText,
  dismissText = 'Cancel',
  alternativeText,
  icon = 'exclamation-triangle',
  onConfirm,
  onDismiss,
  onAlternative,
}: ConfirmModalProps): JSX.Element => {
  const [disabled, setDisabled] = useState(Boolean(confirmationText));
  const styles = useStyles2(getStyles);
  const onConfirmationTextChange = (event: React.FormEvent<HTMLInputElement>) => {
    setDisabled(confirmationText?.localeCompare(event.currentTarget.value) !== 0);
  };

  return (
    <Modal className={styles.modal} title={title} icon={icon} isOpen={isOpen} onDismiss={onDismiss}>
      <div className={styles.modalContent}>
        <div className={styles.modalText}>
          {body}
          {description ? <div className={styles.modalDescription}>{description}</div> : null}
          {confirmationText ? (
            <div className={styles.modalConfirmationInput}>
              <HorizontalGroup justify="center">
                <Input placeholder={`Type ${confirmationText} to confirm`} onChange={onConfirmationTextChange} />
              </HorizontalGroup>
            </div>
          ) : null}
        </div>
        <HorizontalGroup justify="center">
          {onAlternative ? (
            <Button variant="primary" onClick={onAlternative}>
              {alternativeText}
            </Button>
          ) : null}
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={disabled}
            aria-label={selectors.pages.ConfirmModal.delete}
          >
            {confirmText}
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            {dismissText}
          </Button>
        </HorizontalGroup>
      </div>
    </Modal>
  );
};

const getStyles = (theme: GrafanaThemeV2) => ({
  modal: css`
    width: 500px;
  `,
  modalContent: css`
    text-align: center;
  `,
  modalText: css({
    fontSize: theme.typography.h4.fontSize,
    color: theme.colors.text.primary,
    marginBottom: `calc(${theme.spacing(2)}*2)`,
    paddingTop: theme.spacing(2),
  }),
  modalDescription: css({
    fontSize: theme.typography.h6.fontSize,
    paddingTop: theme.spacing(2),
  }),
  modalConfirmationInput: css({
    paddingTop: theme.spacing(2),
  }),
});

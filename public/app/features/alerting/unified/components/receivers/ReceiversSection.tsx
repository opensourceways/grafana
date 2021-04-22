import { css } from '@emotion/css';
import { GrafanaTheme } from '@grafana/data';
import { LinkButton, useStyles } from '@grafana/ui';
import React, { FC } from 'react';

interface Props {
  title: string;
  description: string;
  addButtonLabel: string;
  addButtonTo: string;
}

export const ReceiversSection: FC<Props> = ({ title, description, addButtonLabel, addButtonTo, children }) => {
  const styles = useStyles(getStyles);
  return (
    <>
      <div className={styles.heading}>
        <div>
          <h4>{title}</h4>
          <p className={styles.description}>{description}</p>
        </div>
        <LinkButton href={addButtonTo} icon="plus">
          {addButtonLabel}
        </LinkButton>
      </div>
      {children}
    </>
  );
};

const getStyles = (theme: GrafanaTheme) => ({
  heading: css`
    margin-top: ${theme.spacing.xl};
    display: flex;
    justify-content: space-between;
  `,
  description: css`
    color: ${theme.colors.textSemiWeak};
  `,
});

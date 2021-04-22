import { css } from '@emotion/css';
import { GrafanaTheme } from '@grafana/data';
import { Alert, Button, Field, Input, LinkButton, TextArea, useStyles } from '@grafana/ui';
import { useCleanup } from 'app/core/hooks/useCleanup';
import { AlertManagerCortexConfig } from 'app/plugins/datasource/alertmanager/types';
import React, { FC } from 'react';
import { useForm, Validate } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useUnifiedAlertingSelector } from '../../hooks/useUnifiedAlertingSelector';
import { updateAlertManagerConfigAction } from '../../state/actions';
import { makeAMLink } from '../../utils/misc';

interface Values {
  name: string;
  content: string;
}

const defaults: Values = Object.freeze({
  name: '',
  content: '',
});

interface Props {
  existing?: Values;
  config: AlertManagerCortexConfig;
  alertManagerSourceName: string;
}

export const TemplateForm: FC<Props> = ({ existing, alertManagerSourceName, config }) => {
  const styles = useStyles(getStyles);
  const dispatch = useDispatch();

  useCleanup((state) => state.unifiedAlerting.saveAMConfig);

  const { loading, error } = useUnifiedAlertingSelector((state) => state.saveAMConfig);

  const submit = (values: Values) => {
    // wrap content in "define" if it's not already wrapped
    let content = values.content.trim();
    if (!content.match(/\{\{\s*define/)) {
      const indentedContent = content
        .split('\n')
        .map((line) => '  ' + line)
        .join('\n');
      content = `{{ define "${values.name}" }}\n${indentedContent}\n{{ end }}`;
    }

    // add new template to template map
    const template_files = {
      ...config.template_files,
      [values.name]: content,
    };

    // delete existing one (if name changed, otherwise it was overwritten in previous step)
    if (existing && existing.name !== values.name) {
      delete template_files[existing.name];
    }

    // make sure name for the template is configured on the alertmanager config object
    const templates = [
      ...(config.alertmanager_config.templates ?? []).filter((name) => name !== existing?.name),
      values.name,
    ];

    const newConfig: AlertManagerCortexConfig = {
      template_files,
      alertmanager_config: {
        ...config.alertmanager_config,
        templates,
      },
    };
    dispatch(updateAlertManagerConfigAction({ alertManagerSourceName, newConfig, oldConfig: config }));
  };

  const { handleSubmit, register, errors } = useForm<Values>({
    mode: 'onSubmit',
    defaultValues: existing ?? defaults,
  });

  const validateNameIsUnique: Validate = (name: string) => {
    return !config.template_files[name] || existing?.name === name
      ? true
      : 'Another template with this name already exists.';
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <h4>Create message template</h4>
      {error && (
        <Alert severity="error" title="Error saving template">
          {error.message || (error as any)?.data?.message || String(error)}
        </Alert>
      )}
      <Field label="Template name" error={errors?.name?.message} invalid={!!errors.name?.message}>
        <Input
          width={42}
          autoFocus={true}
          ref={register({
            required: { value: true, message: 'Required.' },
            validate: { nameIsUnique: validateNameIsUnique },
          })}
          name="name"
        />
      </Field>
      <Field
        description={
          <>
            You can use the{' '}
            <a href="https://pkg.go.dev/text/template?utm_source=godoc" target="__blank">
              Go templating language
            </a>
            .{' '}
            <a href="https://prometheus.io/blog/2016/03/03/custom-alertmanager-templates/" target="__blank">
              More info about alertmanager templates
            </a>
          </>
        }
        label="Content"
        error={errors?.content?.message}
        invalid={!!errors.content?.message}
      >
        <TextArea
          className={styles.textarea}
          ref={register({ required: { value: true, message: 'Required.' } })}
          name="content"
          rows={12}
        />
      </Field>
      <div className={styles.buttons}>
        {loading && (
          <Button disabled={true} icon="fa fa-spinner" variant="primary">
            Saving...
          </Button>
        )}
        {!loading && <Button variant="primary">Save template</Button>}
        <LinkButton
          disabled={loading}
          href={makeAMLink('/alerting/notifications', alertManagerSourceName)}
          variant="secondary"
          type="button"
        >
          Cancel
        </LinkButton>
      </div>
    </form>
  );
};

const getStyles = (theme: GrafanaTheme) => ({
  buttons: css`
    & > * + * {
      margin-left: ${theme.v2.spacing(1)};
    }
  `,
  textarea: css`
    max-width: 758px;
  `,
});

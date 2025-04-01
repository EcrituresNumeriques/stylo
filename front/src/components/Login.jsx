import { HelpCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import { applicationConfig } from "../config.js";
import { fromFormData } from "../helpers/forms.js";

import Button from "./Button";
import Field from "./Field";
import InlineAlert from "./feedback/InlineAlert.jsx";

import formStyles from "./form.module.scss";
import styles from "./login.module.scss";

export default function Login() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { replace, location } = useHistory();
  const setSessionToken = useCallback(
    (token) => dispatch({ type: "UPDATE_SESSION_TOKEN", token }),
    [],
  );
  const authToken = new URLSearchParams(location.hash).get("#auth-token");

  const { backendEndpoint } = applicationConfig;

  useEffect(() => {
    if (authToken) {
      setSessionToken(authToken);
      replace(location.pathname);
    }
  }, [authToken]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    const data = fromFormData(event.target);
    setError("");

    fetch(backendEndpoint + "/login/local", {
      method: "POST",
      // this parameter enables the cookie directive (set-cookie)
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response.ok
          ? response.json()
          : Promise.reject(new Error("Email or password is incorrect"));
      })
      .then((data) => dispatch({ type: "LOGIN", ...data }))
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("credentials.login.confirmButton")}</title>
      </Helmet>

      <section className={styles.box}>
        <h1>{t("credentials.login.title")}</h1>

        <fieldset className={styles.section}>
          <legend>
            <h2 id="external-login">
              {t("credentials.login.withRemoteAccount")}
            </h2>
          </legend>

          <p>
            <a
              className={styles.humaNumConnectBtn}
              href={backendEndpoint + "/login/openid"}
              lang="fr"
              aria-label={t("credentials.login.withService", {
                name: "Huma-Num",
              })}
            >
              Huma-Num
            </a>
          </p>

          <p className={styles.help}>
            <HelpCircle size={18} className={styles.inlineIcon} aria-hidden />
            <a href="https://humanum.hypotheses.org/5754#content">
              {t("credentials.login.howto")}
            </a>
          </p>

          <p className={styles.help}>
            <HelpCircle size={18} className={styles.inlineIcon} aria-hidden />
            <Trans i18nKey="credentials.login.remoteAccountHelp">
              If you use the same email address for your
              <strong>existing</strong>
              Stylo account and for your Huma-Num account, the two accounts will
              be automatically merged.
            </Trans>
          </p>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>
            <h2 id="local-login">{t("credentials.login.withLocalAccount")}</h2>
          </legend>

          <form
            onSubmit={handleSubmit}
            className={formStyles.form}
            aria-labelledby="local-login"
          >
            <Field
              label={t("user.account.username")}
              name="username"
              hasError={error !== ""}
              required={true}
              autoFocus={true}
              autoComplete="username"
            />
            <Field
              label={t("credentials.password.placeholder")}
              name="password"
              hasError={error !== ""}
              required={true}
              type="password"
              autoComplete="current-password"
            />

            {error && <InlineAlert message={error} />}
            <ul className={styles.actions}>
              <li>
                <Link to="/register">
                  {t("credentials.login.registerLink")}
                </Link>
              </li>
              <li className={styles.actionsSubmit}>
                <Button primary={true} type="submit">
                  {t("credentials.login.confirmButton")}
                </Button>
              </li>
            </ul>
          </form>
        </fieldset>
      </section>
    </>
  );
}

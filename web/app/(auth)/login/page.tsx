"use client";

import { useState } from "react";
import { Card, Form, FormLayout, TextField, Button, Text, Stack } from "@shopify/polaris";
import { supabase } from "../../../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setSending(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setSent(true);
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "48px auto" }}>
      <Card sectioned>
        <Form onSubmit={handleLogin}>
          <FormLayout>
            <Text variant="headingLg" as="h1">
              Sign in
            </Text>
            <TextField
              value={email}
              onChange={setEmail}
              label="Email"
              type="email"
              autoComplete="email"
              requiredIndicator
              disabled={sent}
            />
            <Button primary submit loading={sending} disabled={sent}>
              {sent ? "Check your email" : "Send magic link"}
            </Button>
            {error && <Text color="critical">{error}</Text>}
            <Stack alignment="center">
              <Button
                onClick={async () => {
                  setError("");
                  const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
                  if (error) setError(error.message);
                }}
              >
                Sign in with Google
              </Button>
              <Button
                onClick={async () => {
                  setError("");
                  const { error } = await supabase.auth.signInWithOAuth({ provider: "github" });
                  if (error) setError(error.message);
                }}
              >
                Sign in with GitHub
              </Button>
            </Stack>
          </FormLayout>
        </Form>
      </Card>
    </div>
  );
}
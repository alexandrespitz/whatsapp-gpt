'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Form, FormLayout, TextField, Select, Button, InlineError } from '@shopify/polaris';
import { getEntity, fetchEntityTypes, updateEntity } from '@/lib/data/entities';

// ...code...

useEffect(() => {
  getEntity(id).then(setEntity);
}, [id]);

  const handleSubmit = async () => {
    setError('');
    if (!name || !typeId) {
      setError('Name and type are required.');
      return;
    }
    let parsedFields = null;
    if (fields.trim().length > 0) {
      try {
        parsedFields = JSON.parse(fields);
      } catch (e) {
        setError('Invalid JSON in fields.');
        return;
      }
    }
    const entity = await updateEntity(id, { name, type_id: typeId, status, fields: parsedFields });
    if (entity?.id) {
      router.push(`/app/entities/${entity.id}`);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <Card title="Edit Entity" sectioned>
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              requiredIndicator
              autoComplete="off"
            />
            <Select
              label="Type"
              options={entityTypes.map((et) => ({ label: et.name, value: et.id }))}
              value={typeId}
              onChange={setTypeId}
              placeholder="Select type"
            />
            <TextField
              label="Status"
              value={status}
              onChange={setStatus}
              autoComplete="off"
            />
            <TextField
              label="Fields (JSON)"
              value={fields}
              onChange={setFields}
              multiline={4}
              autoComplete="off"
              placeholder='{"key": "value"}'
            />
            {error && <InlineError message={error} fieldID="fields" />}
            <Button primary submit>Save</Button>
          </FormLayout>
        </Form>
      </Card>
    </div>
  );
}
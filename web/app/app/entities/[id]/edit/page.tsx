'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Form, FormLayout, TextField, Select, Button, InlineError } from '@shopify/polaris';
import { getEntity, fetchEntityTypes, updateEntity } from '@/lib/data/entities';

export default function EditEntityPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : (params.id?.[0] || '');
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [status, setStatus] = useState('');
  const [fields, setFields] = useState('');
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntityTypes().then(setEntityTypes);
    if (id) {
      getEntity(id).then((entity) => {
        if (entity) {
          setName(entity.name || '');
          setTypeId(entity.type_id || '');
          setStatus(entity.status || '');
          setFields(entity.fields ? JSON.stringify(entity.fields, null, 2) : '');
        }
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    setError('');
    if (!name || !typeId) { setError('Name and type are required.'); return; }
    let parsedFields = null;
    if (fields.trim()) {
      try { parsedFields = JSON.parse(fields); } catch { setError('Invalid JSON in fields.'); return; }
    }
    const updated = await updateEntity(id, { name, type_id: typeId, status, fields: parsedFields });
    if (updated?.id) router.push(`/app/entities/${updated.id}`);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <Card title="Edit Entity" sectioned>
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField label="Name" value={name} onChange={setName} requiredIndicator />
            <Select label="Type" options={entityTypes.map(et => ({ label: et.name, value: et.id }))} value={typeId} onChange={setTypeId} placeholder="Select type" />
            <TextField label="Status" value={status} onChange={setStatus} />
            <TextField label="Fields (JSON)" value={fields} onChange={setFields} multiline={4} placeholder='{"key":"value"}' />
            {error && <InlineError message={error} fieldID="fields" />}
            <Button primary submit>Save</Button>
          </FormLayout>
        </Form>
      </Card>
    </div>
  );
}
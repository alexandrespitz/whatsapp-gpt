import { getEntity } from '@/lib/data/entities';
import { Card, TextContainer, Heading, Button } from '@shopify/polaris';
import Link from 'next/link';

export default async function EntityDetailPage({ params }: { params: { id: string } }) {
  const entity = await getEntity(params.id);

  if (!entity) {
    return <div>Entity not found.</div>;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <Heading>{entity.name}</Heading>
      <TextContainer>
        <div>Status: {entity.status ?? <em>None</em>}</div>
        <div>Type: {entity.type_name}</div>
        {entity.fields && (
          <Card title="Fields" sectioned>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(entity.fields, null, 2)}
            </pre>
          </Card>
        )}
        <Card title="Location" sectioned>
          <div>Map placeholder (read-only, wiring later)</div>
        </Card>
        <div style={{ marginTop: 24 }}>
          <Link href={`/app/entities/${params.id}/edit`}>
            <Button primary>Edit</Button>
          </Link>
        </div>
      </TextContainer>
    </div>
  );
}
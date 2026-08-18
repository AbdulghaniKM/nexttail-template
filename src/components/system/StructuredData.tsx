import { structuredDataJson, type StructuredData as StructuredDataEntry } from '@/utils/seo';

export interface StructuredDataProps {
  data: StructuredDataEntry | StructuredDataEntry[];
}

/**
 * Renders JSON-LD for rich results. Drop it anywhere in a Server Component —
 * `@context` is added for you.
 *
 *   <StructuredData data={{ '@type': 'Product', name: product.name }} />
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredDataJson(data) }}
    />
  );
}

export default StructuredData;

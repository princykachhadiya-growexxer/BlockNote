import BlockEditor from "@/components/BlockEditor";

export default function DocumentPage({ params }) {
  const { id } = params;
  return <BlockEditor docId={id} />;
}

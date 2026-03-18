"use client";

import { use } from "react";
import HubEditor from "@/components/admin/HubEditor";

export default function EditHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <HubEditor hubId={id} />;
}

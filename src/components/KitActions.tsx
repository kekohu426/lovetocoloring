"use client";
import Link from "next/link";
import { Download, Printer } from "lucide-react";

export function KitActions({ id }: { id: string }) {
  return <div className="kit-actions"><a href={`/api/kits/${id}/export?format=guide-pdf&include=final,steps,swatch`} download><Download size={18} />Download guide PDF</a><a href={`/api/kits/${id}/print`} target="_blank" rel="noreferrer"><Printer size={18} />Print guide</a><Link href={`/kits/${id}/export`}>Export all files</Link></div>;
}

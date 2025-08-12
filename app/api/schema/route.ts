import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'udyam_form_schema.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(raw);
    return NextResponse.json(json, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Schema not found', details: err?.message }, { status: 500 });
  }
}



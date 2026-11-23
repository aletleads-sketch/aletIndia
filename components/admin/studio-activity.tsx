"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { ActivityTable } from "@/components/admin/studio-dashboard";
import { Loader } from "@/components/admin/loader";
import { Notice, StudioHeader, card, selectClass } from "@/components/admin/studio-ui";
import { memberName } from "@/lib/leads";
import { CONTENT_TABLES, loadActivity, type Activity } from "@/lib/studio";

const TYPES = [...new Set(Object.values(CONTENT_TABLES).map((kind) => kind.type))];

/** Every saved change of the last 90 days, newest first. */
export function StudioActivity() {
  const { team } = useAdmin();
  const [rows, setRows] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [person, setPerson] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadActivity(new Date(Date.now() - 90 * 24 * 3600 * 1000)).then((result) => {
      if (cancelled) return;
      setRows(result.activity);
      setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const names = useMemo(() => new Map(team.map((member) => [member.id, memberName(member)])), [team]);
  const shown = (rows ?? []).filter((row) => (!type || CONTENT_TABLES[row.table_name]?.type === type) && (!person || (person === "system" ? !row.actor : row.actor === person)));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StudioHeader crumbs={[{ label: "CMS", href: "/admin" }, { label: "All Activity" }]} back="/admin" title="All Activity" subtitle="Every change saved in the last 90 days, with who made it." />
        <div className="px-4 pt-5 pb-8 lg:px-8">
          {!rows ? (
            <Loader label="Loading activity…" />
          ) : (
            <section className={`${card} overflow-hidden`}>
              {error ? <Notice tone="bad">{error}</Notice> : null}
              <div className="flex flex-wrap items-center gap-3 p-4">
                <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Type" className={selectClass}>
                  <option value="">All types</option>
                  {TYPES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <select value={person} onChange={(event) => setPerson(event.target.value)} aria-label="Person" className={selectClass}>
                  <option value="">Everyone</option>
                  {team.map((member) => (
                    <option key={member.id} value={member.id}>
                      {memberName(member)}
                    </option>
                  ))}
                  <option value="system">System</option>
                </select>
                <span className="ml-auto text-sm text-[#5b6b85]">{shown.length} changes</span>
              </div>
              {shown.length ? <ActivityTable rows={shown.slice(0, 300)} names={names} /> : <p className="px-5 pb-6 text-sm text-[#5b6b85]">No changes match.</p>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

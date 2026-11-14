import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";

/** Read-only account summary reached from the avatar menu. */
export default function ProfilePage() {
  const { user, profile, role, signOut } = useAuth();
  const signInId = user?.email || user?.phoneNumber || "";

  return (
    <PageContainer size="narrow">
      <PageHeader title="Profile" subtitle="Your account on Eagle International School" />
      <SectionCard>
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name} size={80} tone="brand" />
          <div className="min-w-0">
            <p className="break-words text-title font-bold text-text-primary">{profile?.full_name}</p>
            <p className="text-body capitalize text-text-secondary">{role}</p>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-divider border-t border-divider text-body">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-text-secondary">School</dt>
            <dd className="text-right font-semibold text-text-primary">{profile?.school_name || "Eagle International School"}</dd>
          </div>
          {signInId && (
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-text-secondary">Signs in with</dt>
              <dd className="break-all text-right font-semibold text-text-primary">{signInId}</dd>
            </div>
          )}
        </dl>
        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={signOut}>
            <Icon name="logout" size={20} /> Sign out
          </Button>
        </div>
      </SectionCard>
    </PageContainer>
  );
}

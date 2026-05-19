import React from 'react';

import { User } from '../../shared/types/User';
import { UserCard } from '../UserCard/UserCard';

export interface TeamProps {
  users: User[];
}
export function RedTeam({ users }: TeamProps): React.ReactElement {
  // const redMembers = users.filter((u) => u.team === 'red');
  const redMembers = users;

  return (
    <section className="mb-12 rounded-2xl bg-red-600 px-6 py-10 shadow-lg sm:px-8 sm:py-12">
      <div>
        <div className="mb-2 inline-block rounded-full bg-red-800 px-4 py-1">
          <span className="text-sm font-semibold text-white">Team Members</span>
        </div>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Red Team</h2>
      </div>
      <div className="mt-8">
        {redMembers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {redMembers.map((user) => (
              <UserCard key={user.uid} user={user} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-red-800 px-6 py-8 text-center">
            <p className="text-white">No red team members</p>
          </div>
        )}
      </div>
    </section>
  );
}

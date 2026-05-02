import React from 'react';

import { User } from '../../shared/types/User';

export interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps): React.ReactElement {
  return (
    <div className="group flex flex-col items-center rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative overflow-hidden rounded-full">
        <img
          src={user.photoUrl}
          alt={user.displayName}
          className="h-28 w-28 object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <h3 className="mt-4 text-center text-lg font-bold text-gray-900">
        {user.displayName}
      </h3>
      <a
        href={`mailto:${user.email}`}
        className="mt-2 text-sm text-team-blue transition-colors duration-200 hover:text-team-blue/80 hover:underline focus:rounded focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-team-blue"
      >
        {user.email}
      </a>
    </div>
  );
}

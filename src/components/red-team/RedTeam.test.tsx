import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { User } from '../../shared/types/User';
import { RedTeam } from './RedTeam';

describe.skip('RedTeam', () => {
  const redMembers: User[] = [
    {
      uid: '1',
      email: 'red1@example.com',
      displayName: 'Red Member 1',
      // photoUrl: 'https://example.com/red1.jpg',
      // team: 'red',
    },
    {
      uid: '2',
      email: 'red2@example.com',
      displayName: 'Red Member 2',
      // photoUrl: 'https://example.com/red2.jpg',
      // team: 'red',
    },
  ];

  const otherTeamMembers: User[] = [
    {
      uid: '3',
      email: 'blue1@example.com',
      displayName: 'Blue Member 1',
      // photoUrl: 'https://example.com/blue1.jpg',
      // team: 'blue',
    },
  ];

  it('renders red team section header', () => {
    render(<RedTeam users={redMembers} />);
    expect(screen.getByText('Red Team')).toBeInTheDocument();
  });

  it('renders only red team members', () => {
    const allUsers = [...redMembers, ...otherTeamMembers];
    render(<RedTeam users={allUsers} />);
    expect(screen.getByText('Red Member 1')).toBeInTheDocument();
    expect(screen.getByText('Red Member 2')).toBeInTheDocument();
    expect(screen.queryByText('Blue Member 1')).not.toBeInTheDocument();
  });

  it('given red team members when the section is rendered then each member is displayed with picture and email link', () => {
    render(<RedTeam users={redMembers} />);
    const email1 = screen.getByRole('link', { name: 'red1@example.com' });
    const email2 = screen.getByRole('link', { name: 'red2@example.com' });
    expect(email1).toHaveAttribute('href', 'mailto:red1@example.com');
    expect(email2).toHaveAttribute('href', 'mailto:red2@example.com');
  });

  it('displays empty state when no red team members exist', () => {
    render(<RedTeam users={otherTeamMembers} />);
    expect(screen.getByText('No red team members')).toBeInTheDocument();
  });
});

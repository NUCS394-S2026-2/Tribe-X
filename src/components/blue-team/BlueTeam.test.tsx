import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { User } from '../../shared/types/User';
import { BlueTeam } from './BlueTeam';

describe('BlueTeam', () => {
  const blueMembers: User[] = [
    {
      uid: '1',
      email: 'blue1@example.com',
      displayName: 'Blue Member 1',
      photoUrl: 'https://example.com/blue1.jpg',
      team: 'blue',
    },
    {
      uid: '2',
      email: 'blue2@example.com',
      displayName: 'Blue Member 2',
      photoUrl: 'https://example.com/blue2.jpg',
      team: 'blue',
    },
  ];

  const otherTeamMembers: User[] = [
    {
      uid: '3',
      email: 'red1@example.com',
      displayName: 'Red Member 1',
      photoUrl: 'https://example.com/red1.jpg',
      team: 'red',
    },
  ];

  it('renders blue team section header', () => {
    render(<BlueTeam users={blueMembers} />);
    expect(screen.getByText('Blue Team')).toBeInTheDocument();
  });

  it('renders only blue team members', () => {
    const allUsers = [...blueMembers, ...otherTeamMembers];
    render(<BlueTeam users={allUsers} />);
    expect(screen.getByText('Blue Member 1')).toBeInTheDocument();
    expect(screen.getByText('Blue Member 2')).toBeInTheDocument();
    expect(screen.queryByText('Red Member 1')).not.toBeInTheDocument();
  });

  it('given blue team members when the section is rendered then each member is displayed with picture and email link', () => {
    render(<BlueTeam users={blueMembers} />);
    const email1 = screen.getByRole('link', { name: 'blue1@example.com' });
    const email2 = screen.getByRole('link', { name: 'blue2@example.com' });
    expect(email1).toHaveAttribute('href', 'mailto:blue1@example.com');
    expect(email2).toHaveAttribute('href', 'mailto:blue2@example.com');
  });

  it('displays empty state when no blue team members exist', () => {
    render(<BlueTeam users={otherTeamMembers} />);
    expect(screen.getByText('No blue team members')).toBeInTheDocument();
  });
});

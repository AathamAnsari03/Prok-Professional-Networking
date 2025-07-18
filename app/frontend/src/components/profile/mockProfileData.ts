import { User, Profile, Post } from '../../types';

export const mockUser: User = {
  id: 1,
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
  created_at: '2022-01-01T00:00:00Z',
};

export const mockProfile: Profile = {
  id: 1,
  user_id: 1,
  bio: 'Full Stack Developer passionate about building impactful products. Lover of React, Node.js, and beautiful UI.',
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'UI/UX'],
  experiences: [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      start_date: '2020-06-01',
      end_date: '2023-04-01',
      description: 'Led a team of 5 engineers to build scalable web applications.'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Webify',
      start_date: '2018-01-01',
      end_date: '2020-05-31',
      description: 'Developed modern, responsive UIs with React and Redux.'
    }
  ],
  education: [
    {
      id: 1,
      school: 'Stanford University',
      degree: 'B.Sc.',
      field: 'Computer Science',
      start_date: '2014-09-01',
      end_date: '2018-06-01',
    }
  ]
};

export const mockPosts: Post[] = [
  {
    id: 1,
    user_id: 1,
    content: 'Excited to share my latest project on GitHub! 🚀',
    created_at: '2023-06-01T10:00:00Z',
    likes: 34,
    comments: [
      { id: 1, user_id: 2, content: 'Awesome work!', created_at: '2023-06-01T11:00:00Z' }
    ]
  },
  {
    id: 2,
    user_id: 1,
    content: 'Attending React Summit 2023! Who else is here?',
    created_at: '2023-05-20T09:00:00Z',
    likes: 21,
    comments: []
  }
];

export const mockConnections = {
  total: 128,
  mutual: 8
};

export const mockSocials = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/janedoe', icon: 'linkedin' },
  { name: 'GitHub', url: 'https://github.com/janedoe', icon: 'github' },
  { name: 'Twitter', url: 'https://twitter.com/janedoe', icon: 'twitter' }
]; 
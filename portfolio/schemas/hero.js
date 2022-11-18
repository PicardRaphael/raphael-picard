export default {
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
    },
    {
      name: 'typeWriter',
      title: 'Type Writer',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'speciality',
      title: 'Speciality',
      type: 'string',
    },
    {
      name: 'together',
      title: 'Together',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'profilePic',
      title: 'ProfilePic',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'skill',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'skill' } }],
    },
  ],
};

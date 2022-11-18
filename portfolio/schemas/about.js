export default {
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    {
      title: 'About',
      name: 'about',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'aboutPic',
      title: 'AboutPic',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
};

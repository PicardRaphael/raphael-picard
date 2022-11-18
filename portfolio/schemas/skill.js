export default {
  name: 'skill',
  title: 'Skill',
  type: 'document',
  fields: [
    {
      name: "title",
      title: 'Title',
      type: 'string'
    },
    {
      name: "image",
      title: "Image",
      type: 'image',
      options: {
        hotspot: true,
      }
    },
    {
      name: "link",
      title: 'Link',
      type: 'url'
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string'
    },
    {
      name: 'speciality',
      title: 'speciality',
      type: 'string'
    },
    {
      name: "position",
      title: 'Position',
      type: 'string'
    },
  ],
}

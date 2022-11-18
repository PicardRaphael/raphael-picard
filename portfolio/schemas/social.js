export default {
  name: 'social',
  title: 'Social',
  type: 'document',
  fields: [
    {
      name: "title",
      title: 'Title',
      type: 'string'
    },
    {
      name: 'url',
      title: "Url",
      type: 'url'
    },
    {
      name: "image",
      title: "Image",
      type: 'image',
      options: {
        hotspot: true,
      }
    },
  ],
}

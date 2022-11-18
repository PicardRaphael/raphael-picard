export default {
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    {
      name: "name",
      title: 'Name',
      type: 'string'
    },
    {
      name: "role",
      title: "Role",
      type: 'string',
    },
    {
      name: "logo",
      title: "Logo",
      type: 'image',
      options: {
        hotspot: true,
      }
    },
    {
      name: "email",
      title: "Email",
      type: 'string',
    },
    {
      name: "phoneNumber",
      title: "PhoneNumber",
      type: 'string',
    },
    {
      name: "address",
      title: "Address",
      type: 'string',
    },
    {
      name: 'country',
      title: "Country",
      type: 'string'
    },
    {
      name: 'city',
      title: "City",
      type: 'string'
    },
    {
      name: 'socials',
      title: 'Socials',
      type: "array",
      of: [{type: 'reference', to: {type: 'social'}}]
    },
  ],
}

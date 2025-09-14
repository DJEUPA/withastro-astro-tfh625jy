import { defineDb, defineTable, column } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    username: column.text({ unique: true }),
    email: column.text({ unique: true }),
    password: column.text(),
    role: column.text({ default: 'admin' }),
    createdAt: column.date({ default: new Date() })
  }
});

const Article = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    description: column.text(),
    content: column.text(),
    image: column.text(),
    category: column.text(), // 'architecture' or 'construction'
    published: column.boolean({ default: false }),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() })
  }
});

export default defineDb({
  tables: { User, Article }
});
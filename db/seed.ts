import { db, User, Article } from 'astro:db';
import bcrypt from 'bcryptjs';

export default async function seed() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await db.insert(User).values([
    {
      id: 1,
      username: 'admin',
      email: 'admin@wfapartners.com',
      password: hashedPassword,
      role: 'admin'
    }
  ]);

  // Create sample articles
  await db.insert(Article).values([
    {
      id: 1,
      title: 'Villa Moderne Contemporaine',
      description: 'Conception d\'une villa moderne avec des lignes épurées et des matériaux nobles.',
      content: 'Cette villa contemporaine de 300m² allie modernité et confort. Les grandes baies vitrées offrent une luminosité exceptionnelle...',
      image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
      category: 'architecture',
      published: true
    },
    {
      id: 2,
      title: 'Rénovation Complète Appartement',
      description: 'Transformation complète d\'un appartement parisien avec optimisation de l\'espace.',
      content: 'Rénovation totale d\'un appartement de 80m² avec redistribution des espaces et modernisation complète...',
      image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1200',
      category: 'construction',
      published: true
    }
  ]);
}
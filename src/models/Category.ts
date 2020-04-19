import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  getRepository,
} from 'typeorm';

@Entity('categories')
class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  static async findOrCreate(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    let category = await categoryRepository.findOne({ title });
    if (category) return category;
    category = new Category();
    category.title = title;

    return categoryRepository.save(category);
  }
}

export default Category;

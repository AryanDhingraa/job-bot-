import { Resolver, Query, Mutation, Arg, Int, Authorized } from 'type-graphql';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';

@Resolver(User)
export class UserResolver {
  private userRepository = AppDataSource.getRepository(User);

  @Authorized('admin') // Only admins can query all users
  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userRepository.find();
  }

  @Authorized('admin') // Only admins can update user role
  @Mutation(() => User)
  async updateUserRole(
    @Arg('userId', () => Int) userId: number,
    @Arg('role', () => String) role: 'candidate' | 'lecturer' | 'admin',
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found!');
    }
    user.role = role;
    await this.userRepository.save(user);
    return user;
  }

  @Authorized('admin') // Only admins can block/unblock users
  @Mutation(() => User)
  async toggleBlockUser(
    @Arg('userId', () => Int) userId: number,
    @Arg('isBlocked', () => Boolean) isBlocked: boolean,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found!');
    }
    user.is_blocked = isBlocked;
    await this.userRepository.save(user);
    return user;
  }
} 
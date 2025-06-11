import { Resolver, Query, Mutation, Arg, Int, Authorized, Subscription, Root, ObjectType, Field, Ctx } from 'type-graphql';
import { PubSubEngine } from 'graphql-subscriptions';
import { AppDataSource } from '../../data-source';
import { Application } from '../../entity/Application';
import { User } from '../../entity/User';
import { Course } from '../../entity/Course';

// Define the payload type for the candidate availability subscription
@ObjectType()
class CandidateAvailabilityPayload {
  @Field(() => Int)
  candidateId!: number;

  @Field()
  candidateUsername!: string;

  @Field()
  isAvailable!: boolean;

  @Field({ nullable: true })
  message?: string;
}

@Resolver(Application)
export class ApplicationResolver {
  private applicationRepository = AppDataSource.getRepository(Application);
  private userRepository = AppDataSource.getRepository(User);
  private courseRepository = AppDataSource.getRepository(Course);

  @Authorized('admin')
  @Query(() => [Application])
  async applications(): Promise<Application[]> {
    return this.applicationRepository.find({ relations: ['user', 'course'] });
  }

  @Authorized('admin')
  @Mutation(() => Application)
  async updateApplicationStatusGraphQL(
    @Arg('applicationId', () => Int) applicationId: number,
    @Arg('status', () => String) status: 'pending' | 'accepted' | 'rejected' | 'approved',
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new Error('Application not found!');
    }

    if (!['pending', 'accepted', 'rejected', 'approved'].includes(status)) {
      throw new Error('Invalid status provided.');
    }

    application.status = status;
    await this.applicationRepository.save(application);
    return application;
  }

  @Authorized('admin')
  @Mutation(() => Boolean)
  async markCandidateAsUnavailable(
    @Arg('candidateId', () => Int) candidateId: number,
    @Arg('isAvailable', () => Boolean) isAvailable: boolean,
    @Arg('message', { nullable: true }) message: string,
    @Ctx() { pubSub }: { pubSub: PubSubEngine },
  ): Promise<boolean> {
    const candidate = await this.userRepository.findOne({ where: { id: candidateId, role: 'candidate' } });
    if (!candidate) {
      throw new Error('Candidate not found or not a candidate user!');
    }

    // Assuming you have a field like isAvailableForHiring on the User entity
    // You might need to add this field to your User entity (backend/src/entity/User.ts)
    candidate.isAvailableForHiring = isAvailable;
    await this.userRepository.save(candidate);

    // Publish the event
    await pubSub.publish('CANDIDATE_AVAILABILITY_CHANGED', {
      candidateAvailabilityChanged: {
        candidateId: candidate.id,
        candidateUsername: candidate.username,
        isAvailable: candidate.isAvailableForHiring,
        message,
      },
    });

    return true;
  }

  @Subscription(() => CandidateAvailabilityPayload, {
    topics: 'CANDIDATE_AVAILABILITY_CHANGED',
  })
  candidateAvailabilityChanged(
    @Root() payload: CandidateAvailabilityPayload,
  ): CandidateAvailabilityPayload {
    return payload;
  }

  @Authorized('admin')
  @Query(() => [Application])
  async approvedApplicationsByCourse(): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { status: 'approved' },
      relations: ['user', 'course'],
      order: {
        course: { name: 'ASC' },
        user: { username: 'ASC' },
      },
    });
  }
} 
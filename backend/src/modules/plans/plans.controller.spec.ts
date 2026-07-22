import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

describe('PlansController', () => {
  let controller: PlansController;
  let service: PlansService;

  const mockPlan = {
    _id: 'mock-plan-id',
    name: 'Pro Plan',
    description: 'A mock plan',
    price: 9.99,
    status: 'ACTIVE',
    features: [],
    billingCycle: 'MONTHLY',
    stripeProductId: 'prod_123',
    stripePriceId: 'price_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPlansService = {
    create: jest
      .fn()
      .mockImplementation((dto: CreatePlanDto) =>
        Promise.resolve({ _id: 'mock-plan-id', ...dto }),
      ),
    findAll: jest.fn().mockResolvedValue([mockPlan]),
    findOne: jest.fn().mockResolvedValue(mockPlan),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdatePlanDto) =>
        Promise.resolve({ ...mockPlan, ...dto }),
      ),
    setStatus: jest
      .fn()
      .mockImplementation((id: string, status: string) =>
        Promise.resolve({ ...mockPlan, status }),
      ),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        {
          provide: PlansService,
          useValue: mockPlansService,
        },
      ],
    }).compile();

    controller = module.get<PlansController>(PlansController);
    service = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a plan', async () => {
    const dto: CreatePlanDto = {
      name: 'Pro Plan',
      description: 'A mock plan',
      price: 9.99,
      features: [],
      billingCycle: 'MONTHLY',
    };
    const result = await controller.create(dto);
    expect(result).toEqual({ _id: 'mock-plan-id', ...dto });
    expect(jest.spyOn(service, 'create')).toHaveBeenCalledWith(dto);
  });

  it('should find all plans', async () => {
    const result = await controller.findAll('ACTIVE');
    expect(result).toEqual([mockPlan]);
    expect(jest.spyOn(service, 'findAll')).toHaveBeenCalledWith({
      status: 'ACTIVE',
    });
  });

  it('should find a plan by id', async () => {
    const result = await controller.findOne('mock-plan-id');
    expect(result).toEqual(mockPlan);
    expect(jest.spyOn(service, 'findOne')).toHaveBeenCalledWith('mock-plan-id');
  });

  it('should update a plan', async () => {
    const dto: UpdatePlanDto = { name: 'New Name' };
    const result = await controller.update('mock-plan-id', dto);
    expect(result).toEqual({ ...mockPlan, ...dto });
    expect(jest.spyOn(service, 'update')).toHaveBeenCalledWith(
      'mock-plan-id',
      dto,
    );
  });

  it('should set status', async () => {
    const result = await controller.setStatus('mock-plan-id', 'INACTIVE');
    expect(result).toEqual({ ...mockPlan, status: 'INACTIVE' });
    expect(jest.spyOn(service, 'setStatus')).toHaveBeenCalledWith(
      'mock-plan-id',
      'INACTIVE',
    );
  });

  it('should delete a plan', async () => {
    const result = await controller.remove('mock-plan-id');
    expect(result).toEqual({ deleted: true });
    expect(jest.spyOn(service, 'remove')).toHaveBeenCalledWith('mock-plan-id');
  });
});

using FluentAssertions;
using NSubstitute;
using SuspensionDesigner.Application.Commands;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.Interfaces;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Tests.Handlers;

public class CreateDesignHandlerTests
{
    private readonly ISuspensionDesignRepository _repo = Substitute.For<ISuspensionDesignRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    private static CreateDesignCommand CreateValidCommand() => new()
    {
        Name = "Test Design",
        Description = "FSAE front",
        SuspensionType = 0,
        AxlePosition = 0,
        UpperWishboneFrontPivot = new Point3DDto(100, 250, 300),
        UpperWishboneRearPivot = new Point3DDto(-100, 250, 300),
        UpperBallJoint = new Point3DDto(0, 600, 280),
        LowerWishboneFrontPivot = new Point3DDto(120, 200, 150),
        LowerWishboneRearPivot = new Point3DDto(-120, 200, 150),
        LowerBallJoint = new Point3DDto(0, 620, 130),
        TieRodInner = new Point3DDto(-80, 220, 160),
        TieRodOuter = new Point3DDto(-80, 610, 155),
        SpringDamperUpper = new Point3DDto(0, 350, 400),
        SpringDamperLower = new Point3DDto(0, 400, 150),
        PushrodWheelEnd = new Point3DDto(0, 500, 160),
        PushrodRockerEnd = new Point3DDto(0, 300, 380),
        TrackWidth = 1200,
        Wheelbase = 1550,
        SprungMass = 200,
        UnsprungMass = 25,
        SpringRate = 25,
        DampingCoefficient = 1.5,
        RideHeight = 50,
        TireRadius = 228,
        CgHeight = 300,
        FrontBrakeProportion = 0.6,
        UserId = "user-123",
    };

    [Fact]
    public async Task Handle_AddsDesignToRepository()
    {
        var handler = new CreateDesignHandler(_repo, _uow);
        await handler.Handle(CreateValidCommand(), CancellationToken.None);

        await _repo.Received(1).AddAsync(Arg.Any<SuspensionDesign>(), Arg.Any<CancellationToken>());
        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ReturnsDto_WithCorrectName()
    {
        var handler = new CreateDesignHandler(_repo, _uow);
        var result = await handler.Handle(CreateValidCommand(), CancellationToken.None);

        result.Name.Should().Be("Test Design");
        result.Description.Should().Be("FSAE front");
    }

    [Fact]
    public async Task Handle_MapsHardpointsCorrectly()
    {
        var handler = new CreateDesignHandler(_repo, _uow);
        var result = await handler.Handle(CreateValidCommand(), CancellationToken.None);

        result.UpperWishboneFrontPivot.Should().Be(new Point3DDto(100, 250, 300));
        result.LowerBallJoint.Should().Be(new Point3DDto(0, 620, 130));
    }

    [Fact]
    public async Task Handle_MapsVehicleParamsCorrectly()
    {
        var handler = new CreateDesignHandler(_repo, _uow);
        var result = await handler.Handle(CreateValidCommand(), CancellationToken.None);

        result.TrackWidth.Should().Be(1200);
        result.SpringRate.Should().Be(25);
        result.FrontBrakeProportion.Should().Be(0.6);
    }

    [Fact]
    public async Task Handle_AssignsNewId()
    {
        var handler = new CreateDesignHandler(_repo, _uow);
        var result = await handler.Handle(CreateValidCommand(), CancellationToken.None);

        result.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_SetsTimestamps()
    {
        var handler = new CreateDesignHandler(_repo, _uow);
        var before = DateTime.UtcNow.AddSeconds(-1);
        var result = await handler.Handle(CreateValidCommand(), CancellationToken.None);

        result.CreatedAt.Should().BeAfter(before);
        result.UpdatedAt.Should().BeAfter(before);
    }
}

public class GetDesignHandlerTests
{
    private readonly ISuspensionDesignRepository _repo = Substitute.For<ISuspensionDesignRepository>();
    private readonly Guid _designId = Guid.NewGuid();

    private SuspensionDesign CreateDesign() => new()
    {
        Id = _designId,
        Name = "My Design",
        UpperWishboneFrontPivot = new Point3D(100, 250, 300),
        UpperWishboneRearPivot = new Point3D(-100, 250, 300),
        UpperBallJoint = new Point3D(0, 600, 280),
        LowerWishboneFrontPivot = new Point3D(120, 200, 150),
        LowerWishboneRearPivot = new Point3D(-120, 200, 150),
        LowerBallJoint = new Point3D(0, 620, 130),
        TieRodInner = new Point3D(-80, 220, 160),
        TieRodOuter = new Point3D(-80, 610, 155),
        SpringDamperUpper = new Point3D(0, 350, 400),
        SpringDamperLower = new Point3D(0, 400, 150),
        PushrodWheelEnd = new Point3D(0, 500, 160),
        PushrodRockerEnd = new Point3D(0, 300, 380),
        TrackWidth = 1200,
    };

    [Fact]
    public async Task Handle_WhenDesignExists_ReturnsDto()
    {
        _repo.GetByIdAsync(_designId, Arg.Any<CancellationToken>()).Returns(CreateDesign());
        var handler = new GetDesignHandler(_repo);

        var result = await handler.Handle(new GetDesignRequest(_designId), CancellationToken.None);

        result.Should().NotBeNull();
        result!.Name.Should().Be("My Design");
        result.Id.Should().Be(_designId);
    }

    [Fact]
    public async Task Handle_WhenDesignDoesNotExist_ReturnsNull()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((SuspensionDesign?)null);
        var handler = new GetDesignHandler(_repo);

        var result = await handler.Handle(new GetDesignRequest(Guid.NewGuid()), CancellationToken.None);

        result.Should().BeNull();
    }
}

public class ListDesignsHandlerTests
{
    private readonly ISuspensionDesignRepository _repo = Substitute.For<ISuspensionDesignRepository>();

    private static SuspensionDesign MakeDesign(string name) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        UpperWishboneFrontPivot = new Point3D(100, 250, 300),
        UpperWishboneRearPivot = new Point3D(-100, 250, 300),
        UpperBallJoint = new Point3D(0, 600, 280),
        LowerWishboneFrontPivot = new Point3D(120, 200, 150),
        LowerWishboneRearPivot = new Point3D(-120, 200, 150),
        LowerBallJoint = new Point3D(0, 620, 130),
        TieRodInner = new Point3D(-80, 220, 160),
        TieRodOuter = new Point3D(-80, 610, 155),
        SpringDamperUpper = new Point3D(0, 350, 400),
        SpringDamperLower = new Point3D(0, 400, 150),
        PushrodWheelEnd = new Point3D(0, 500, 160),
        PushrodRockerEnd = new Point3D(0, 300, 380),
        UserId = "user-1",
    };

    [Fact]
    public async Task Handle_ReturnsDesignsForUser()
    {
        var designs = new List<SuspensionDesign> { MakeDesign("A"), MakeDesign("B") };
        _repo.GetAllByUserAsync("user-1", Arg.Any<CancellationToken>()).Returns(designs);
        var handler = new ListDesignsHandler(_repo);

        var result = await handler.Handle(new ListDesignsRequest("user-1"), CancellationToken.None);

        result.Should().HaveCount(2);
        result[0].Name.Should().Be("A");
        result[1].Name.Should().Be("B");
    }

    [Fact]
    public async Task Handle_WhenNoDesigns_ReturnsEmptyList()
    {
        _repo.GetAllByUserAsync("user-2", Arg.Any<CancellationToken>()).Returns(new List<SuspensionDesign>());
        var handler = new ListDesignsHandler(_repo);

        var result = await handler.Handle(new ListDesignsRequest("user-2"), CancellationToken.None);

        result.Should().BeEmpty();
    }
}

public class UpdateDesignHandlerTests
{
    private readonly ISuspensionDesignRepository _repo = Substitute.For<ISuspensionDesignRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly Guid _designId = Guid.NewGuid();

    private SuspensionDesign CreateExistingDesign() => new()
    {
        Id = _designId,
        Name = "Old Name",
        UpperWishboneFrontPivot = new Point3D(100, 250, 300),
        UpperWishboneRearPivot = new Point3D(-100, 250, 300),
        UpperBallJoint = new Point3D(0, 600, 280),
        LowerWishboneFrontPivot = new Point3D(120, 200, 150),
        LowerWishboneRearPivot = new Point3D(-120, 200, 150),
        LowerBallJoint = new Point3D(0, 620, 130),
        TieRodInner = new Point3D(-80, 220, 160),
        TieRodOuter = new Point3D(-80, 610, 155),
        SpringDamperUpper = new Point3D(0, 350, 400),
        SpringDamperLower = new Point3D(0, 400, 150),
        PushrodWheelEnd = new Point3D(0, 500, 160),
        PushrodRockerEnd = new Point3D(0, 300, 380),
        TrackWidth = 1200,
        UserId = "user-1",
    };

    [Fact]
    public async Task Handle_WhenDesignExists_UpdatesAndSaves()
    {
        _repo.GetByIdAsync(_designId, Arg.Any<CancellationToken>()).Returns(CreateExistingDesign());
        var handler = new UpdateDesignHandler(_repo, _uow);
        var command = new UpdateDesignCommand
        {
            Id = _designId,
            Name = "New Name",
            TrackWidth = 1300,
            UpperWishboneFrontPivot = new Point3DDto(100, 250, 300),
            UpperWishboneRearPivot = new Point3DDto(-100, 250, 300),
            UpperBallJoint = new Point3DDto(0, 600, 280),
            LowerWishboneFrontPivot = new Point3DDto(120, 200, 150),
            LowerWishboneRearPivot = new Point3DDto(-120, 200, 150),
            LowerBallJoint = new Point3DDto(0, 620, 130),
            TieRodInner = new Point3DDto(-80, 220, 160),
            TieRodOuter = new Point3DDto(-80, 610, 155),
            SpringDamperUpper = new Point3DDto(0, 350, 400),
            SpringDamperLower = new Point3DDto(0, 400, 150),
            PushrodWheelEnd = new Point3DDto(0, 500, 160),
            PushrodRockerEnd = new Point3DDto(0, 300, 380),
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Name.Should().Be("New Name");
        result.TrackWidth.Should().Be(1300);
        _repo.Received(1).Update(Arg.Any<SuspensionDesign>());
        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenDesignNotFound_ReturnsNull()
    {
        _repo.GetByIdAsync(_designId, Arg.Any<CancellationToken>()).Returns((SuspensionDesign?)null);
        var handler = new UpdateDesignHandler(_repo, _uow);
        var command = new UpdateDesignCommand { Id = _designId, Name = "X" };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().BeNull();
        _repo.DidNotReceive().Update(Arg.Any<SuspensionDesign>());
    }
}

public class DeleteDesignHandlerTests
{
    private readonly ISuspensionDesignRepository _repo = Substitute.For<ISuspensionDesignRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly Guid _designId = Guid.NewGuid();

    [Fact]
    public async Task Handle_WhenDesignExists_DeletesAndReturnsTrue()
    {
        var design = new SuspensionDesign
        {
            Id = _designId,
            Name = "To Delete",
            UpperWishboneFrontPivot = new Point3D(0, 0, 0),
            UpperWishboneRearPivot = new Point3D(0, 0, 0),
            UpperBallJoint = new Point3D(0, 0, 0),
            LowerWishboneFrontPivot = new Point3D(0, 0, 0),
            LowerWishboneRearPivot = new Point3D(0, 0, 0),
            LowerBallJoint = new Point3D(0, 0, 0),
            TieRodInner = new Point3D(0, 0, 0),
            TieRodOuter = new Point3D(0, 0, 0),
            SpringDamperUpper = new Point3D(0, 0, 0),
            SpringDamperLower = new Point3D(0, 0, 0),
            PushrodWheelEnd = new Point3D(0, 0, 0),
            PushrodRockerEnd = new Point3D(0, 0, 0),
        };
        _repo.GetByIdAsync(_designId, Arg.Any<CancellationToken>()).Returns(design);
        var handler = new DeleteDesignHandler(_repo, _uow);

        var result = await handler.Handle(new DeleteDesignRequest(_designId), CancellationToken.None);

        result.Should().BeTrue();
        _repo.Received(1).Delete(design);
        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenDesignNotFound_ReturnsFalse()
    {
        _repo.GetByIdAsync(_designId, Arg.Any<CancellationToken>()).Returns((SuspensionDesign?)null);
        var handler = new DeleteDesignHandler(_repo, _uow);

        var result = await handler.Handle(new DeleteDesignRequest(_designId), CancellationToken.None);

        result.Should().BeFalse();
        _repo.DidNotReceive().Delete(Arg.Any<SuspensionDesign>());
    }
}

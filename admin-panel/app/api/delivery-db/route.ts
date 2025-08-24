// Delivery System API with Database Integration
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'deliveries':
        const status = searchParams.get('status');
        const partnerId = searchParams.get('partnerId');
        const zoneId = searchParams.get('zoneId');
        
        const deliveries = await prisma.delivery.findMany({
          where: {
            ...(status && { status }),
            ...(partnerId && { deliveryPartnerId: partnerId }),
            ...(zoneId && { zoneId })
          },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                customerName: true,
                customerPhone: true
              }
            },
            partner: {
              select: {
                id: true,
                name: true,
                phone: true,
                vehicleType: true,
                status: true,
                rating: true
              }
            },
            zone: {
              select: {
                id: true,
                name: true,
                deliveryFee: true,
                estimatedTime: true
              }
            },
            trackingUpdates: {
              orderBy: { timestamp: 'desc' },
              take: 5
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        });

        return NextResponse.json(deliveries);

      case 'partners':
        const partnerStatus = searchParams.get('status');
        
        const partners = await prisma.deliveryPartner.findMany({
          where: {
            ...(partnerStatus && { status: partnerStatus }),
            isActive: true
          },
          include: {
            deliveries: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
              },
              select: {
                id: true,
                status: true,
                rating: true,
                deliveredAt: true
              }
            }
          },
          orderBy: { totalDeliveries: 'desc' }
        });

        return NextResponse.json(partners.map(partner => ({
          ...partner,
          currentLocation: partner.currentLocation ? JSON.parse(partner.currentLocation) : null,
          recentDeliveries: partner.deliveries.length,
          avgRating: partner.deliveries.length > 0 
            ? partner.deliveries.reduce((sum, d) => sum + (d.rating || 5), 0) / partner.deliveries.length
            : partner.rating
        })));

      case 'zones':
        const zones = await prisma.deliveryZone.findMany({
          include: {
            deliveries: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              },
              select: {
                id: true,
                status: true,
                actualTime: true
              }
            }
          },
          orderBy: { priority: 'asc' }
        });

        return NextResponse.json(zones.map(zone => ({
          ...zone,
          polygon: JSON.parse(zone.polygon),
          weeklyDeliveries: zone.deliveries.length,
          avgDeliveryTime: zone.deliveries.length > 0
            ? zone.deliveries.reduce((sum, d) => sum + (d.actualTime || zone.estimatedTime), 0) / zone.deliveries.length
            : zone.estimatedTime
        })));

      case 'tracking':
        const deliveryId = searchParams.get('deliveryId');
        const trackingNumber = searchParams.get('trackingNumber');
        
        let delivery;
        if (deliveryId) {
          delivery = await prisma.delivery.findUnique({
            where: { id: deliveryId },
            include: {
              trackingUpdates: {
                orderBy: { timestamp: 'asc' }
              },
              partner: true,
              zone: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  totalAmount: true,
                  customerName: true,
                  customerPhone: true,
                  customerAddress: true
                }
              }
            }
          });
        } else if (trackingNumber) {
          delivery = await prisma.delivery.findUnique({
            where: { trackingNumber },
            include: {
              trackingUpdates: {
                orderBy: { timestamp: 'asc' }
              },
              partner: true,
              zone: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  totalAmount: true,
                  customerName: true,
                  customerPhone: true,
                  customerAddress: true
                }
              }
            }
          });
        }

        if (!delivery) {
          return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
        }

        return NextResponse.json(delivery);

      case 'dashboard-stats':
        const [
          totalDeliveries,
          activeDeliveries,
          availablePartners,
          avgDeliveryTime,
          todayDeliveries,
          pendingDeliveries
        ] = await Promise.all([
          prisma.delivery.count(),
          prisma.delivery.count({
            where: { status: { in: ['assigned', 'picked_up', 'in_transit'] } }
          }),
          prisma.deliveryPartner.count({
            where: { status: 'available', isActive: true }
          }),
          prisma.delivery.aggregate({
            where: { 
              status: 'delivered',
              actualTime: { not: null }
            },
            _avg: { actualTime: true }
          }),
          prisma.delivery.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }),
          prisma.delivery.count({
            where: { status: 'pending' }
          })
        ]);

        return NextResponse.json({
          totalDeliveries,
          activeDeliveries,
          availablePartners,
          avgDeliveryTime: avgDeliveryTime._avg.actualTime || 0,
          todayDeliveries,
          pendingDeliveries,
          deliverySuccess: 95.5, // mock data
          onTimeDelivery: 87.3 // mock data
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Delivery API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery data', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const body = await req.json();

    switch (type) {
      case 'delivery':
        const newDelivery = await prisma.delivery.create({
          data: {
            orderId: body.orderId,
            pickupAddress: body.pickupAddress,
            pickupLatitude: body.pickupLatitude,
            pickupLongitude: body.pickupLongitude,
            deliveryAddress: body.deliveryAddress,
            deliveryLatitude: body.deliveryLatitude,
            deliveryLongitude: body.deliveryLongitude,
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            customerNotes: body.customerNotes,
            deliveryFee: body.deliveryFee || 0,
            estimatedTime: body.estimatedTime,
            priority: body.priority || 'normal',
            zoneId: body.zoneId
          },
          include: {
            order: true,
            zone: true
          }
        });

        // Create initial tracking update
        await prisma.deliveryTracking.create({
          data: {
            deliveryId: newDelivery.id,
            status: 'pending',
            notes: 'Delivery created and awaiting assignment'
          }
        });

        return NextResponse.json(newDelivery);

      case 'partner':
        const newPartner = await prisma.deliveryPartner.create({
          data: {
            name: body.name,
            phone: body.phone,
            email: body.email,
            licenseNumber: body.licenseNumber,
            vehicleType: body.vehicleType,
            vehicleNumber: body.vehicleNumber,
            status: body.status || 'available'
          }
        });

        return NextResponse.json(newPartner);

      case 'zone':
        const newZone = await prisma.deliveryZone.create({
          data: {
            name: body.name,
            description: body.description,
            polygon: JSON.stringify(body.polygon),
            deliveryFee: body.deliveryFee || 0,
            minOrderAmount: body.minOrderAmount || 0,
            maxOrderAmount: body.maxOrderAmount,
            estimatedTime: body.estimatedTime || 30,
            priority: body.priority || 1
          }
        });

        return NextResponse.json({
          ...newZone,
          polygon: JSON.parse(newZone.polygon)
        });

      case 'tracking':
        const tracking = await prisma.deliveryTracking.create({
          data: {
            deliveryId: body.deliveryId,
            status: body.status,
            location: body.location,
            latitude: body.latitude,
            longitude: body.longitude,
            notes: body.notes
          }
        });

        // Update delivery status
        await prisma.delivery.update({
          where: { id: body.deliveryId },
          data: { 
            status: body.status,
            ...(body.status === 'picked_up' && { pickedUpAt: new Date() }),
            ...(body.status === 'delivered' && { deliveredAt: new Date() }),
            ...(body.status === 'cancelled' && { cancelledAt: new Date() })
          }
        });

        return NextResponse.json(tracking);

      case 'assign':
        const { deliveryId, partnerId } = body;
        
        const updatedDelivery = await prisma.delivery.update({
          where: { id: deliveryId },
          data: {
            deliveryPartnerId: partnerId,
            status: 'assigned',
            assignedAt: new Date()
          },
          include: {
            partner: true,
            order: true
          }
        });

        // Update partner status
        await prisma.deliveryPartner.update({
          where: { id: partnerId },
          data: { status: 'busy' }
        });

        // Create tracking update
        await prisma.deliveryTracking.create({
          data: {
            deliveryId,
            status: 'assigned',
            notes: `Assigned to ${updatedDelivery.partner?.name}`
          }
        });

        return NextResponse.json(updatedDelivery);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Delivery API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    switch (type) {
      case 'delivery':
        const updatedDelivery = await prisma.delivery.update({
          where: { id },
          data: {
            status: body.status,
            priority: body.priority,
            deliveryPartnerId: body.deliveryPartnerId,
            customerNotes: body.customerNotes,
            actualTime: body.actualTime,
            rating: body.rating,
            feedback: body.feedback,
            proofOfDelivery: body.proofOfDelivery,
            cancellationReason: body.cancellationReason
          },
          include: {
            partner: true,
            order: true,
            zone: true
          }
        });

        return NextResponse.json(updatedDelivery);

      case 'partner':
        const updatedPartner = await prisma.deliveryPartner.update({
          where: { id },
          data: {
            name: body.name,
            phone: body.phone,
            email: body.email,
            status: body.status,
            currentLocation: body.currentLocation ? JSON.stringify(body.currentLocation) : undefined,
            lastActive: new Date()
          }
        });

        return NextResponse.json({
          ...updatedPartner,
          currentLocation: updatedPartner.currentLocation ? JSON.parse(updatedPartner.currentLocation) : null
        });

      case 'zone':
        const updatedZone = await prisma.deliveryZone.update({
          where: { id },
          data: {
            name: body.name,
            description: body.description,
            polygon: body.polygon ? JSON.stringify(body.polygon) : undefined,
            deliveryFee: body.deliveryFee,
            minOrderAmount: body.minOrderAmount,
            maxOrderAmount: body.maxOrderAmount,
            estimatedTime: body.estimatedTime,
            priority: body.priority,
            isActive: body.isActive
          }
        });

        return NextResponse.json({
          ...updatedZone,
          polygon: JSON.parse(updatedZone.polygon)
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Delivery API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    switch (type) {
      case 'delivery':
        await prisma.delivery.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });

      case 'partner':
        await prisma.deliveryPartner.update({
          where: { id },
          data: { isActive: false }
        });
        return NextResponse.json({ success: true });

      case 'zone':
        await prisma.deliveryZone.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Delivery API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}

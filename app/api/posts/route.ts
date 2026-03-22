import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CATEGORY_SLUGS, POSTS_PER_PAGE } from '@/lib/constants'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { postSchema } from '@/lib/schemas'
import { slugify } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const categoryParam = searchParams.get('category')
  const search = searchParams.get('search')
  const location = searchParams.get('location')
  const funding = searchParams.get('funding')
  const remote = searchParams.get('remote')
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const tag = searchParams.get('tag')

  const skip = (page - 1) * POSTS_PER_PAGE

  const category = categoryParam ? CATEGORY_SLUGS[categoryParam] || (categoryParam as Prisma.EnumCategoryFilter) : undefined

  const where: Prisma.PostWhereInput = {
    status: 'PUBLISHED',
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(funding && { fundingType: funding as Prisma.EnumFundingTypeFilter }),
    ...(remote === 'true' && { isRemote: true }),
    ...(tag && { tags: { some: { name: tag } } }),
  }

  const orderBy: Prisma.PostOrderByWithRelationInput =
    sort === 'deadline' ? { deadline: 'asc' }
    : sort === 'trending' ? { views: 'desc' }
    : { createdAt: 'desc' }

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { tags: true },
        orderBy: [{ sponsored: 'desc' }, { featured: 'desc' }, orderBy],
        skip,
        take: POSTS_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / POSTS_PER_PAGE),
    })
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = postSchema.parse(body)

    const slug = slugify(data.title) + '-' + Date.now().toString(36)

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        category: data.category,
        organization: data.organization,
        location: data.location,
        isRemote: data.isRemote,
        fundingType: data.fundingType,
        description: data.description,
        eligibility: data.eligibility,
        applyUrl: data.applyUrl,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status,
        featured: data.featured,
        sponsored: data.sponsored,
        tags: data.tags
          ? {
              connectOrCreate: data.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    console.error('POST /api/posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.sql import Select
from math import ceil
from typing import TypeVar, Generic, Type, Any
from src.api.schemas.common import PaginatedResponse

T = TypeVar("T")

async def paginate(
    session: AsyncSession,
    query: Select,
    page: int,
    size: int,
    schema: Type[T] = None
) -> PaginatedResponse[T]:
    if page < 1:
        page = 1
    if size < 1:
        size = 10

    # Calculate total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar_one()

    # Calculate total pages
    pages = ceil(total / size)

    # Apply limit and offset
    paginated_query = query.limit(size).offset((page - 1) * size)
    result = await session.execute(paginated_query)
    db_items = result.scalars().all()

    # Convert to Pydantic models if schema is provided, otherwise return dicts
    # Note: If no schema provided, caller is responsible for serialization
    items = [schema.model_validate(item) for item in db_items] if schema else db_items

    return PaginatedResponse[T](
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

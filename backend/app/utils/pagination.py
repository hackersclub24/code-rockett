from math import ceil


def paginate(total: int, page: int, page_size: int) -> dict:
    pages = max(1, ceil(total / page_size)) if page_size else 1
    return {"total": total, "page": page, "page_size": page_size, "pages": pages}

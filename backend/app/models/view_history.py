from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ViewHistory(Base):
    __tablename__ = "view_history"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    movie_id: Mapped[int] = mapped_column(
        nullable=False,
        index=True,
    )

    view_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    last_viewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "movie_id",
            name="uq_view_history_user_movie",
        ),
    )
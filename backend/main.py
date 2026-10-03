from __future__ import annotations

from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Number Guessing Game API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

games: dict[str, dict[str, Any]] = {}


class StartRequest(BaseModel):
    start: int
    end: int


class AnswerRequest(BaseModel):
    game_id: str
    answer: str


def compute_mid(start: int, end: int) -> int:
    return (start + end) // 2


@app.post("/start")
def start_game(payload: StartRequest):
    if payload.start > payload.end:
        raise HTTPException(status_code=400, detail="Start value cannot be greater than end value.")

    game_id = str(uuid4())
    start = payload.start
    end = payload.end
    guess = compute_mid(start, end)

    state = {
        "game_id": game_id,
        "start": start,
        "end": end,
        "guess": guess,
        "attempts": 1,
        "status": "guess",
        "phase": "check",
    }
    games[game_id] = state

    return {
        "game_id": game_id,
        "status": "guess",
        "phase": "check",
        "guess": guess,
        "attempts": 1,
        "possible_range": [start, end],
    }


@app.post("/answer")
def answer_game(payload: AnswerRequest):
    state = games.get(payload.game_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Game not found.")

    answer = payload.answer.strip().lower()

    if state["phase"] == "check":
        if answer == "yes":
            state["status"] = "won"
            state["phase"] = "result"
            return {
                "game_id": state["game_id"],
                "status": "won",
                "phase": "result",
                "guess": state["guess"],
                "attempts": state["attempts"],
            }

        if answer == "no":
            state["phase"] = "compare"
            return {
                "game_id": state["game_id"],
                "status": "compare",
                "phase": "compare",
                "guess": state["guess"],
                "attempts": state["attempts"],
                "possible_range": [state["start"], state["end"]],
            }

        raise HTTPException(status_code=400, detail="Answer must be 'yes' or 'no'.")

    if state["phase"] == "compare":
        if answer == "greater":
            state["start"] = state["guess"] + 1
        elif answer == "less":
            state["end"] = state["guess"] - 1
        else:
            raise HTTPException(status_code=400, detail="Answer must be 'greater' or 'less'.")

        if state["start"] > state["end"]:
            state["status"] = "lost"
            state["phase"] = "result"
            return {
                "game_id": state["game_id"],
                "status": "lost",
                "phase": "result",
                "guess": state["guess"],
                "attempts": state["attempts"],
                "possible_range": [state["start"], state["end"]],
            }

        state["guess"] = compute_mid(state["start"], state["end"])
        state["attempts"] += 1
        state["phase"] = "check"
        state["status"] = "guess"

        return {
            "game_id": state["game_id"],
            "status": "guess",
            "phase": "check",
            "guess": state["guess"],
            "attempts": state["attempts"],
            "possible_range": [state["start"], state["end"]],
        }

    raise HTTPException(status_code=400, detail="This game is already complete.")


@app.get("/")
def read_root():
    return {"message": "Number Guessing Game API"}

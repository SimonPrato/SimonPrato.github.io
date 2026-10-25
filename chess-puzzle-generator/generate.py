"""Generate random mate-in-one chess puzzles.

Each side gets its king plus a random selection of its other 15 standard
pieces, so a board holds between 2 and 32 pieces. The pieces are placed
on random squares. Each position is
tested twice, once with white to move and once with black to move. A
side's version is kept when it is valid and that side has a mate in one.

The mate check searches exactly one move deep. It tries every legal move
of the side to move once and tests whether the result is checkmate. It
never looks at a second move by the attacker.
"""
import argparse
import random

import chess

# The 15 pieces besides the king that each side may receive.
OTHER_PIECES = (
    [chess.QUEEN]
    + [chess.ROOK] * 2
    + [chess.BISHOP] * 2
    + [chess.KNIGHT] * 2
    + [chess.PAWN] * 8
)
SIDES = {"white": [chess.WHITE], "black": [chess.BLACK], "both": [chess.WHITE, chess.BLACK]}


def random_army(rng):
    """Return the king plus a random number (0 to 15) of the other pieces."""
    extra = rng.randint(0, len(OTHER_PIECES))
    return [chess.KING] + rng.sample(OTHER_PIECES, extra)


def random_board(rng, min_pieces, max_pieces):
    """Place two random armies on random squares.

    Both kings are always present. Pawns never go on the first or last rank.
    """
    while True:
        armies = {color: random_army(rng) for color in chess.COLORS}
        if min_pieces <= sum(len(a) for a in armies.values()) <= max_pieces:
            break
    board = chess.Board(None)
    # Place pawns first so they always find a square on ranks 2 to 7.
    order = [(p, c) for c in chess.COLORS for p in armies[c]]
    order.sort(key=lambda pc: pc[0] != chess.PAWN)
    free = set(chess.SQUARES)
    for piece_type, color in order:
        allowed = [sq for sq in sorted(free)
                   if piece_type != chess.PAWN or chess.square_rank(sq) not in (0, 7)]
        sq = rng.choice(allowed)
        board.set_piece_at(sq, chess.Piece(piece_type, color))
        free.remove(sq)
    return board


def mates_in_one(board):
    """Return the mating moves for the side to move, searching depth one only.

    Each legal move is played once. is_checkmate() then asks whether the
    defender is in check and has no legal reply. That is the definition of
    mate, not a deeper search, since no attacker move after the first is
    ever considered.
    """
    result = []
    for move in board.legal_moves:
        board.push(move)
        if board.is_checkmate():
            result.append(move)
        board.pop()
    return result


def generate(count, unique, side, seed, min_pieces=2, max_pieces=32):
    """Yield (board, mating_moves) until count puzzles have been found."""
    rng = random.Random(seed)
    found = 0
    while found < count:
        board = random_board(rng, min_pieces, max_pieces)
        for turn in SIDES[side]:
            board.turn = turn
            # Validity depends on the side to move: the side not to move
            # must not be in check.
            if not board.is_valid():
                continue
            mates = mates_in_one(board)
            if not mates or (unique and len(mates) != 1):
                continue
            found += 1
            yield board.copy(), mates
            if found >= count:
                return


def main():
    parser = argparse.ArgumentParser(description="Generate random mate-in-one chess puzzles.")
    parser.add_argument("-n", "--count", type=int, default=10, help="number of puzzles")
    parser.add_argument("--unique", action="store_true", help="require exactly one mating move")
    parser.add_argument("--side", choices=list(SIDES), default="both",
                        help="which side to test for a mate in one (default: both)")
    parser.add_argument("--min-pieces", type=int, default=2,
                        help="fewest pieces on the board, kings included (default: 2)")
    parser.add_argument("--max-pieces", type=int, default=32,
                        help="most pieces on the board, kings included (default: 32)")
    parser.add_argument("--seed", type=int, help="random seed for reproducible output")
    parser.add_argument("--show", action="store_true", help="print the board diagram")
    args = parser.parse_args()
    if not 2 <= args.min_pieces <= args.max_pieces <= 32:
        parser.error("piece limits must satisfy 2 <= --min-pieces <= --max-pieces <= 32")

    for board, mates in generate(args.count, args.unique, args.side, args.seed,
                                 args.min_pieces, args.max_pieces):
        mover = "white" if board.turn == chess.WHITE else "black"
        solutions = " ".join(board.san(m) for m in mates)
        print(f"{board.fen()}\t{mover}\t{solutions}")
        if args.show:
            print(board.unicode(empty_square="·"), end="\n\n")


if __name__ == "__main__":
    main()

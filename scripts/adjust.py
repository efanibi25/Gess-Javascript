def adjust_piece_indices(original_pieces: set) -> set:
    """
    Converts piece indices from an old grid width to a new grid width.
    """
    # Define the properties of the old and new grids
    old_width = 22  # 2 (border) + 18 (play area) + 2 (border)
    new_width = 20  # 1 (border) + 18 (play area) + 1 (border)

    # Create a new set to store the adjusted numbers
    new_pieces = set()

    # Loop through each piece in the original set
    for old_index in original_pieces:
        # 1. Convert the old 1D index to a 2D (row, col) coordinate
        # In Python, // performs integer division (equivalent to Math.floor)
        old_row = old_index // old_width
        old_col = old_index % old_width

        # 2. Calculate the new coordinate
        new_row = old_row - 1
        new_col = old_col - 1

        # 3. Convert the new 2D coordinate back to a 1D index
        new_index = (new_row * new_width) + new_col
        
        # Add the newly calculated index to our new set
        new_pieces.add(new_index)

    return new_pieces

# Original numbers for the 2-block border
PLAYER1_PIECES_OLD = {48, 50, 52, 53, 54, 55, 56, 57, 58, 59, 61, 63, 69, 70, 71, 73, 75, 76, 77, 78, 80, 82, 84, 85, 86, 92, 94, 96, 97, 98, 99, 100, 101, 102, 103, 105, 107, 155, 158, 161, 164, 167, 170, 173}
PLAYER2_PIECES_OLD = {309, 312, 315, 318, 321, 324, 327, 378, 380, 382, 383, 384, 385, 386, 387, 388, 389, 391, 393, 399, 400, 401, 403, 405, 406, 407, 408, 410, 412, 414, 415, 416, 422, 424, 426, 427, 428, 429, 430, 431, 432, 433, 435, 437, 439}

# Calculate the new sets of numbers for the 1-block border
player1_pieces_new = adjust_piece_indices(PLAYER1_PIECES_OLD)
player2_pieces_new = adjust_piece_indices(PLAYER2_PIECES_OLD)

# Display the results
print(f"Player 1 New Pieces: {sorted(list(player1_pieces_new))}")
print(f"Player 2 New Pieces: {sorted(list(player2_pieces_new))}")
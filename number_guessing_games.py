def guessNumber(startRange,endRange):
    if startRange>endRange:
        return True

    mid=(startRange+endRange)//2
    print(f"Is the number {mid}?(Y/N): ",end="")
    user=input().strip()

    if user in ("Y", "y"):
        print(f"Yay! I guessed your number {mid} correctly!")
        return False
    elif user in ("N", "n"):
        print(f"Is your number greater than {mid}?(Y/N): ",end="")
        user=input().strip()
        if user in ("Y", "y"):
            return guessNumber(mid+1,endRange)
        elif user in ("N", "n"):
            return guessNumber(startRange,mid-1)
        else:
            print("Invalid input. Please enter Y or N.")
            return guessNumber(startRange,endRange)
#Driver Code
if __name__=="__main__":
    print("Number Guessing Game")
    startRange=int(input("Enter the start of the range: "))
    endRange=int(input("Enter the end of the range: "))
    print(f"Think of a number between {startRange} and {endRange} (inclusive) and I will try to guess it.")
    out=guessNumber(startRange,endRange)
    if out:
        print("Couldn't guess it. Are you sure you answered correctly?")


def convertBP(s):
    # convert basepair for input string
    inverse = ''
    bp = {
        'G': 'C',
        'C': 'G',
        'A': 'T',
        'T': 'A'
    }
    if s:
        for i in s:
            if i in bp.keys():
                inverse += bp[i]
            else:
                inverse += i
    return inverse

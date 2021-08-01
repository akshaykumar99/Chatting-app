import numpy as np
import pandas as pd; 

# reading the glove vector ... 
# filepath is the path where glove vector is present
def read_glove_vecs(filepath):
    with open(filepath, 'r') as file:
        words = set()
        word_to_vec_map = {}
        for line in file: 
            line = line.strip().split()
            curr_word = line[0]
            words.add(curr_word)
            word_to_vec_map[curr_word] = np.array(line[1:], dtype = np.float64)
        
        ind = 1
        words_to_index = {}
        index_to_words = {}
        for word in sorted(words):
            words_to_index[word] = ind
            index_to_words[ind] = word
            ind = ind + 1

    return words_to_index, index_to_words, word_to_vec_map

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum

def convert_to_one_hot(output, tot_classes):
    output = np.asarray(output, dtype = int)
    output = np.eye(tot_classes)[output.reshape(-1)]
    return output

emoji_dict = {0 : "😂", 1 : "😱", 2 : "😠", 3 : "😢", 4 : "😒", 5 : "😔", 6 : "😳"}

def print_predictions(X, pred):
    print()
    for i in range(X.shape[0]):
        print(X[i], emoji_dict[pred[i]])

def predict(X, Y, W, b, word_to_vec_map):
    """
    Arguments:
    X -- input data containing sentences, numpy array of shape (m, None)
    Y -- labels, containing index of the label emoji, numpy array of shape (m, 1)

    Returns:
    pred -- numpy array of shape (m, 1) with your predictions
    """
    m = X.shape[0]
    pred = np.zeros((m, 1))
    for j in range(m):
        words = X[j].lower().split()
        avg = np.zeros((200, ))
        for w in words:
            avg += word_to_vec_map[w]
        avg = avg / len(words)
        # forward propagation
        Z = np.dot(W, avg) + b
        A = softmax(Z)
        pred[j] = np.argmax(A)

    print("Accuracy: "  + str(np.mean((pred[:] == Y.reshape(Y.shape[0],1)[:]))))
    return pred

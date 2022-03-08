const mainComment = document.getElementById("myInput")

const commentList = document.getElementById("commentList")

const addComment = () => {
  if (!localStorage.getItem("comments")) {
    let comments = []
    localStorage.setItem("comments", JSON.stringify(comments))
  }

  comments = JSON.parse(localStorage.getItem("comments"))
  comments.push({
    parentCommentId: null,
    commentId: Math.random().toString().slice(2, 7),
    commentText: mainComment.value,
    childComments: [],
    likes: 0,
    date: new Date().toLocaleString(),
  })
  localStorage.setItem("comments", JSON.stringify(comments))
  finalCommentsViewPage()
  mainComment.value = ""
}

let singleCommentCard = (obj, padding) => `
<div style="background-color: antiquewhite; margin-left: ${padding}px; border: 2px solid green; width: 400px; border-radius: 10px;" data-parentId="${
  obj.parentCommentId
}" id="${obj.commentId}">
        ${obj.commentText}
        <a href="#">Likes</a><span style="color: red">${
          obj.likes === 0 ? " " : obj.likes
        }
        </span>
        <a href="#">Reply</a><span style="color: red"> ${
          obj.childComments.length === 0 ? "" : obj.childComments.length
        }</span>
        <a href="#"> Edit</a>
        <a href="#"> Delete </a>
    </div>
    `

let createRecursiveView = (commentsList, padding = 0) => {
  let fullView = ""
  for (let i of commentsList) {
    fullView += singleCommentCard(i, padding)
    if (i.childComments.length > 0) {
      fullView += createRecursiveView(i.childComments, (padding += 20))
      padding -= 20
    }
  }
  return fullView
}

let finalCommentsViewPage = () => {
  let getCommentsFromLocalStorage = JSON.parse(localStorage.getItem("comments"))
  if (getCommentsFromLocalStorage) {
    let allComments = createRecursiveView(getCommentsFromLocalStorage)
    commentList.innerHTML = allComments
  }
}

finalCommentsViewPage()

let createReplyButtonCommentView = (id, operationType, commentOldData) => {
  let div = document.createElement("div")
  div.setAttribute("data-parentId", id)
  div.innerHTML = `<input type="text" value="${
    operationType === "update Comment" ? commentOldData : ""
  }"><a href="#">${operationType}</a>`
  return div
}

const getAllComments = () => JSON.parse(localStorage.getItem("comments"))

const setAllComments = allComments =>
  localStorage.setItem("comments", JSON.stringify(allComments))

const addNewChildComment = (allComments, newComment) => {
  for (let i of allComments) {
    if (i.commentId === newComment.parentCommentId) {
      i.childComments.push(newComment)
    } else if (i.childComments.length > 0) {
      addNewChildComment(i.childComments, newComment)
    }
  }
}

commentList.addEventListener("click", e => {
  if (e.target.innerText === "Reply") {
    const parentId = !e.target.parentNode.getAttribute("data-parentId")
      ? e.target.parentNode.getAttribute("data-parentId")
      : e.target.parentNode.getAttribute("id")
    const currentParentComment = e.target.parentNode
    currentParentComment.appendChild(
      createReplyButtonCommentView(parentId, "Add Comment")
    )
    e.target.style.display = "none"
    e.target.nextSibling.style.display = "none"
  } else if (e.target.innerHTML === "Add Comment") {
    const parentId = e.target.parentNode.getAttribute("data-parentId")
      ? e.target.parentNode.getAttribute("data-parentId")
      : e.target.parentNode.getAttribute("id")
    const newAddedComment = {
      parentCommentId: parentId,
      commentId: Math.random().toString().slice(2, 7),
      commentText: e.target.previousSibling.value,
      childComments: [],
      likes: 0,
      date: new Date().toLocaleString(),
    }
    let getCommentsFromLocalStorage = getAllComments()
    addNewChildComment(getCommentsFromLocalStorage, newAddedComment)
    setAllComments(getCommentsFromLocalStorage)
  } else if (e.target.innerText === "Edit") {
    const parentId = e.target.parentNode.getAttribute("data-parentId")
      ? e.target.parentNode.getAttribute("data-parentId")
      : e.target.parentNode.getAttribute("id")
    const currentParentComment = e.target.parentNode
    const complateCommentText = e.target.parentNode.innerText
    const commentToArray = complateCommentText.split(" ")
    const findIndexOfLikes = commentToArray.indexOf("Likes")
    const realCommentText = commentToArray.slice(0, findIndexOfLikes)

    currentParentComment.appendChild(
      createReplyButtonCommentView(
        parentId,
        "update Comment",
        realCommentText.join(" ")
      )
    )
    e.target.style.display = "none"
  }
})

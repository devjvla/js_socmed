class PostsController {
  getPosts = async (req, res) => {
    let response_data = { status: true, result: {}, error: null };

    response_data.result = {
      "page": "Dashboard Page"
    }

    res.json(response_data);
  }
}

export default (function user(){
  return new PostsController();
})();
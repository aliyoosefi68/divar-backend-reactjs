const autoBind = require("auto-bind");
const postService = require("./post.service");
const CategoryModel = require("../category/category.model");
const createHttpError = require("http-errors");
const PostMessage = require("./post.messages");
// const HttpCodes = require("http-codes");
const { Types } = require("mongoose");
const { getAddressDetails } = require("../../common/utils/http");
const { removePropertyInObject } = require("../../common/utils/functions");
const utf8 = require("utf8");

class PostController {
  #service;
  successMessage;
  constructor() {
    autoBind(this);
    this.#service = postService;
  }

  async createPostPage(req, res, next) {
    try {
      const { slug } = req.query;

      let match = { parent: null };
      let showBack = false;
      let options, category;

      if (slug) {
        category = await CategoryModel.findOne({ slug });
        if (!category) throw new createHttpError.NotFound(PostMessage.NotFound);
        options = await this.#service.getCategoryOptions(category._id);
        if (options.length == 0) options = null;
        showBack = true;
        match = {
          parent: category._id,
        };
      }
      const categories = await CategoryModel.aggregate([{ $match: match }]);

      return res.status(200).json({
        data: {
          statusCode: 200,
          options,
        },
      });

      // res.render("./pages/panel/create-post.ejs", {
      //   categories,
      //   showBack,
      //   options,
      //   category: category?._id.toString(),
      // });
    } catch (error) {
      next(error);
    }
  }
  async create(req, res, next) {
    try {
      const userId = req.user._id;
      const images = req?.files?.map((image) => image?.path?.slice(7));
      const { title, content, lat, lng, category, amount } = req.body;

      const { address, province, city, district } = await getAddressDetails(
        lat,
        lng
      );

      const options = removePropertyInObject(req.body, [
        "title",
        "content",

        "lat",
        "lng",
        "category",
        "images",
        "amount",
      ]);

      for (let key in options) {
        let value = options[key];
        delete options[key];
        key = utf8.decode(key);
        options[key] = value;
      }

      await this.#service.create({
        userId,
        title,
        content,
        coordinate: [lat, lng],
        category: new Types.ObjectId(category),
        images,
        options,
        address,
        province,
        city,
        district,
        amount,
      });

      // return res.status(HttpCodes.CREATED).json({
      //   message: PostMessage.Created,
      // });

      return res.json({
        message: PostMessage.Created,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async findMyPosts(req, res, next) {
    try {
      const userId = req.user._id;
      const posts = await this.#service.find(userId);
      res.json({
        posts,
        count: posts.length,
      });
    } catch (error) {
      next(error);
    }
  }
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      await this.#service.remove(id);
      this.successMessage = PostMessage.Removed;
      return res.redirect("/post/my");
    } catch (error) {
      next(error);
    }
  }
  async showPost(req, res, next) {
    try {
      const { id } = req.params;
      const post = await this.#service.chechExist(id);

      return res.status(200).json({
        data: {
          statusCode: 200,
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async postList(req, res, next) {
    try {
      const query = req.query;
      const posts = await this.#service.findAll(query);
      res.json({
        posts,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();

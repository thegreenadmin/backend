const { Op } = require("sequelize");
const Page = require("../models/page/page.model");
const PageType = require("../models/page/page_type.model");
const StorePage = require("../models/store/store_page.model");
const CommonController = require("./common.controller");



const getSystemPageByPageType = async function(slug = "") {
    try{
        const __PAGE = await Page.findOne({where: {slug, status: 'active'}})

        if(!__PAGE) {
            throw "Page not found"
        }

        return CommonController.getPageHtml(__PAGE.page_title, __PAGE.page_content);
    }catch(err) {
        throw err;
    }
}





const listPageTypes = async function() {
    try{
        const __PAGE_TYPES = await PageType.findAll({
            where: {status: 'active'},
            attributes: {
                include: [['id', 'page_type_id']],
                exclude: ['id']
            }
        })

        return {page_types: __PAGE_TYPES}

    }catch(err) {
        throw err;
    }
}





const createPage = async function(data) {
    // data = {slug, page_title, page_content, is_system_page}
    try{
        const {slug, page_title, page_content, is_system_page} = data;
        const __PAGE = await Page.create({
            slug, page_title, page_content, is_system_page, status: 'active'
        })

        return {page_id: __PAGE.id}

    }catch(err) {
        throw err;
    }
}





const listPages = async function(data) {
    // data = {q, page, page_size, order_by, order_type}
    try{
        const {q, page, page_size, order_by, order_type} = data;

        const order = order_by && order_type ? [[(order_by == 'page_id' ? 'id' : order_by), order_type]] : [['id', 'DESC']];

        const query = {
            where: {
                page_title: {[Op.iLike]: "%"+q+"%"},
                status: 'active'
            },
            attributes: {
                include: [['id', 'page_id']],
                exclude: ['id', 'page_content']
            }
        }

        const __PAGES = await CommonController.getPaginationResult({
            Model: Page, query, page, page_size, order, as: 'pages'
        })

        return __PAGES;

    }catch(err) {
        throw err;
    }
}




const getPageDetails = async function(data) {
    // data = {page_id}
    try{
        const {page_id} = data;
        const __PAGE = await Page.findOne({
            where: {id: page_id, status: 'active'},
            attributes: {
                include: [['id', 'page_id']],
                exclude: ['id']
            }
        })

        if(!__PAGE) {throw "Page not found"}

        return {page: __PAGE}

    }catch(err) {
        throw err;
    }
}





const updatePage = async function(data) {
    // data = {page_id, slug, page_title, page_content, is_system_page}
    try{
        const {page_id, slug, page_title, page_content, is_system_page} = data;

        const __UPDATE_PAGE = await Page.update({
            slug, page_title, page_content, is_system_page
        },{
            where: {id: page_id, status: 'active'}
        })

        return {
            is_updated: true
        }

    }catch(err) {
        throw err;
    }
}




const deletePage = async function(data) {
    // data = {page_id}
    try{
        const {page_id} = data;
        const __PAGE = await Page.findOne({
            where: {id: page_id}
        })

        if(__PAGE.is_system_page) {
            throw "Can not delete the system pages"
        }

        await Page.update({status: 'deleted'}, {where: {id: page_id}})
        return {is_deleted: true}

    }catch(err) {
        throw err
    }
}





//store page
//store page
//store page
//store page
//store page




















module.exports = {
    listPageTypes, getSystemPageByPageType, 
    listPages, getPageDetails, updatePage, deletePage, createPage,  
    
}
package com.jamescookie

import org.apache.velocity.app.VelocityEngine
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping

import static java.util.Calendar.*
import static java.util.Calendar.instance
import static org.springframework.ui.velocity.VelocityEngineUtils.mergeTemplateIntoString;

@RestController
class MainController {
    @Autowired
    private VelocityEngine engine;

    @RequestMapping("/")
    public String index() {
        render("index", [time: new Date(), message: 'Hello World!'])
    }

    @RequestMapping("/stuff")
    public String stuff() {
        render("stuff", [:])
    }

    private String render(page, LinkedHashMap model) {
        def common = [page: page, isPartyTime: getInstance().get(DAY_OF_WEEK) > 5]
        mergeTemplateIntoString(
                this.engine,
                "views/common.vm", "UTF-8",
                model + common
        )
    }
}

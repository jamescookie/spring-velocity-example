package com.jamescookie

import org.apache.velocity.app.VelocityEngine
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping

import static org.springframework.ui.velocity.VelocityEngineUtils.mergeTemplateIntoString;

@RestController
class MainController {
    @Autowired
    private VelocityEngine engine;

    @RequestMapping("/")
    public String index() {
        return mergeTemplateIntoString(
                this.engine,
                "views/index.vm", "UTF-8",
                [time: new Date(), message: 'Hello World!']
        )
    }
}

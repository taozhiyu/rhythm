package org.b3log.symphony.util;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.b3log.latke.Keys;
import org.b3log.latke.ioc.BeanManager;
import org.b3log.symphony.model.Option;
import org.b3log.symphony.service.OptionMgmtService;
import org.b3log.symphony.service.OptionQueryService;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ReservedWords {

    private static final Logger LOGGER = LogManager.getLogger(ReservedWords.class);

    private static OptionMgmtService optionMgmtService;

    private static OptionQueryService optionQueryService;

    private static final String OPTION_NAME = "reservedWordList";

    private static final List<String> CACHE = new ArrayList<>();

    public static void init() {
        final BeanManager beanManager = BeanManager.getInstance();
        optionMgmtService = beanManager.getReference(OptionMgmtService.class);
        optionQueryService = beanManager.getReference(OptionQueryService.class);
        JSONObject option = optionQueryService.getOption(OPTION_NAME);
        if (null == option) {
            JSONObject addOption = new JSONObject();
            addOption.put(Keys.OBJECT_ID, OPTION_NAME);
            addOption.put(Option.OPTION_CATEGORY, "reversed-word-list");
            addOption.put(Option.OPTION_VALUE, "[]");
            optionMgmtService.addOption(addOption);
            LOGGER.log(Level.INFO, "Reserved word list is empty and generated.");
        } else {
            JSONArray array = new JSONArray(option.optString(Option.OPTION_VALUE));
            for (int i = 0; i < array.length(); i++) {
                String word = String.valueOf(array.get(i));
                CACHE.add(word);
            }
        }
        LOGGER.log(Level.INFO, "Reserved words system is ready.");
    }
}
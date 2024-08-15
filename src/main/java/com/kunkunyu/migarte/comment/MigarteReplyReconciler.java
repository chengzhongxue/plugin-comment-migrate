package com.kunkunyu.migarte.comment;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import run.halo.app.core.extension.User;
import run.halo.app.core.extension.content.Comment;
import run.halo.app.core.extension.content.Reply;
import run.halo.app.extension.DefaultExtensionMatcher;
import run.halo.app.extension.ExtensionClient;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.controller.Controller;
import run.halo.app.extension.controller.ControllerBuilder;
import run.halo.app.extension.controller.Reconciler;
import run.halo.app.extension.router.selector.FieldSelector;

import java.util.List;

import static run.halo.app.extension.ExtensionUtil.*;
import static run.halo.app.extension.index.query.QueryFactory.equal;

@Component
@RequiredArgsConstructor
public class MigarteReplyReconciler implements Reconciler<Reconciler.Request> {
    private final ExtensionClient client;

    @Override
    public Result reconcile(Request request) {
        client.fetch(Reply.class, request.name())
            .ifPresent(reply -> {
                if (isDeleted(reply)) {
                    return;
                }

                var spec = reply.getSpec();
                String kind = spec.getOwner().getKind();
                if (kind.equals("Email")) {
                    var listOptions = new ListOptions();
                    listOptions.setFieldSelector(FieldSelector.of(equal("spec.email",spec.getOwner().getName())));

                    List<User> users = client.listAll(User.class, listOptions, defaultSort());
                    if (!users.isEmpty()) {
                        User user = users.get(0);
                        String name = user.getMetadata().getName();
                        String displayName = user.getSpec().getDisplayName();

                        var commentOwner = new Comment.CommentOwner();
                        commentOwner.setName(name);
                        commentOwner.setDisplayName(displayName);
                        commentOwner.setKind("User");
                        spec.setOwner(commentOwner);
                        client.update(reply);
                    }
                }
            });
        return new Result(false, null);
    }


    @Override
    public Controller setupWith(ControllerBuilder builder) {
        var extension = new Reply();
        return builder
            .extension(extension)
            .onAddMatcher(DefaultExtensionMatcher.builder(client, extension.groupVersionKind())
                .fieldSelector(FieldSelector.of(
                    equal(Reply.REQUIRE_SYNC_ON_STARTUP_INDEX_NAME, BooleanUtils.TRUE))
                )
                .build()
            )
            .build();
    }

    static Sort defaultSort() {
        return Sort.by("metadata.creationTimestamp");
    }

}

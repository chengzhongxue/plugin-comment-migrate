package com.kunkunyu.migarte.comment;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import run.halo.app.core.extension.User;
import run.halo.app.core.extension.content.Comment;
import run.halo.app.core.extension.content.Post;
import run.halo.app.core.extension.content.SinglePage;
import run.halo.app.extension.DefaultExtensionMatcher;
import run.halo.app.extension.ExtensionClient;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Ref;
import run.halo.app.extension.controller.Controller;
import run.halo.app.extension.controller.ControllerBuilder;
import run.halo.app.extension.controller.Reconciler;
import run.halo.app.extension.router.selector.FieldSelector;

import java.util.List;

import static run.halo.app.extension.ExtensionUtil.*;
import static run.halo.app.extension.index.query.Queries.equal;

@Component
@RequiredArgsConstructor
public class MigarteCommentReconciler implements Reconciler<Reconciler.Request> {
    private final ExtensionClient client;

    @Override
    public Result reconcile(Request request) {
        client.fetch(Comment.class, request.name())
            .ifPresent(comment -> {
                if (isDeleted(comment)) {
                    return;
                }

                var spec = comment.getSpec();
                var subjectRef = spec.getSubjectRef();

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
                    }
                }

                handleRatingComment(subjectRef);

                client.update(comment);
            });
        return new Result(false, null);
    }


    private void handleRatingComment(Ref subjectRef) {

        if (subjectRef.getKind().equals("Post")) {
            client.listAll(Post.class, new ListOptions(),defaultSort())
                .stream().filter(post -> subjectRef.getName().equals(post.getStatus().getPermalink()))
                .forEach(post -> {
                    subjectRef.setName(post.getMetadata().getName());
                });
        }

        if (subjectRef.getKind().equals("SinglePage")) {
            client.listAll(SinglePage.class,new ListOptions(),defaultSort())
                .stream().filter(singlePage -> subjectRef.getName().equals(singlePage.getStatus().getPermalink()))
                .forEach(singlePage -> {
                    subjectRef.setName(singlePage.getMetadata().getName());
                });
        }
    }


    @Override
    public Controller setupWith(ControllerBuilder builder) {
        var extension = new Comment();
        return builder
            .extension(extension)
            .onAddMatcher(DefaultExtensionMatcher.builder(client, extension.groupVersionKind())
                .fieldSelector(FieldSelector.of(
                    equal(Comment.REQUIRE_SYNC_ON_STARTUP_INDEX_NAME, BooleanUtils.TRUE))
                )
                .build()
            )
            .build();
    }

    static Sort defaultSort() {
        return Sort.by("metadata.creationTimestamp");
    }

}
